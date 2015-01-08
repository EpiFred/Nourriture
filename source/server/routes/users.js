var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var md5 = require('MD5');
var UserControl = require('../public/javascripts/users_control.js');
var CodeError = require('../public/javascripts/error_code.js');
var Auth = require('../public/javascripts/auth_control.js');
// ====================================================================================================================================

// ====================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

/*
 *  Endpoint to get an user info
 *  Code:
 *      0 : Authentication OK
 */
router.get('/:t/:id', function(req, res)
{
    Auth.CheckAuth(req, res, function()
    {
        var idUser = req.params.id;
        var token = req.params.t;
        if (!(CheckBson.test(idUser)))
            res.status(404).send({request: "error", code: CodeError.CodeUserIdNotFound,info: "User could not be found."});
        var db = req.db;
        db.collection('user').findById(idUser, function (error, account_res) {
            if (error)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            if (account_res === null)
                res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
            else
                if (account_res.auth_token === token)
                    res.status(201).send({request: "success", user: account_res});
                else {
                    delete account_res.auth_token;
                    delete account_res.password;
                    res.status(201).send({request: "success", user: account_res});
                }
        });
    });
});

/*
 *  Route to login
 *  Code:
 *      0 : Authentication OK
 */
router.post('/', function(req, res)
{
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function (error, formInfos, files) {
        var login = formInfos.pseudo;
        var pw = formInfos.password;
        var fn = formInfos.firstname;
        var ln = formInfos.lastname;
        var email = formInfos.email;
        // @TODO Manage avatar

        if ((checkError = UserControl.CheckLogin(login)).code != 0)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckPassword(pw)).code != 0)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckMail(email)).code != 0)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckName(fn, "firstname")).code != 0)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckName(ln, "lastname")).code != 0)
            return (res.status(400).send(checkError));

        var db = req.db;
        db.collection("user", function (err_collection, user_collection) {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else {
                user_collection.findOne({ $or: [{pseudo: login},{email: email}]}, function(err_find, find_res) {
                    if (err_find)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    else if (find_res != null) {
                        if (find_res.pseudo == login)
                            res.status(200).send({request: "error", code: CodeError.CodeUserAlreadyExist, info: "Pseudo '" + login + "' is already used by another user"});
                        else if (find_res.email == email)
                            res.status(200).send({request: "error", code: CodeError.CodeUserAlreadyExist, info: "Email address '" + email + "' is already used by another user"});
                    }
                    else{
                        var new_user = { pseudo: login, password: pw, firstname: fn, lastname: ln, email: email};
                        user_collection.insert(new_user, function(err_insert, insert_res) {
                            if (err_insert)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else if (insert_res == null)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else {
                                var date = new Date;
                                var token = md5(Math.floor(date.getTime()));

                                user_collection.update({_id: insert_res._id}, {$set: {"auth_token": token}}, function (err_update, field_updated) {
                                    if (err_update)
                                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                    else if (field_updated === null)
                                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                    else
                                        res.status(201).send({request: "success", token: token, user: insert_res[0]});
                                });
                            }
                        });
                    }
                });
            }
        });
    });
});

/*
 *  Route to edit user
 *  Code:
 *      0 : Authentication OK
 */
router.put('/:t', function(req, res)
{
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function (error, formInfos, files) {
        var pw = formInfos.password;
        var npw = formInfos.new_password;
        var fn = formInfos.firstname;
        var ln = formInfos.lastname;
        var email = formInfos.email;
        var favorites = formInfos.favorites;
        // @TODO Manage avatar
        var avatar = formInfos.avatar;

        if ((checkError = UserControl.CheckPassword(pw)).code == CodeError.CodeUserFieldInvalid)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckPassword(npw)).code == CodeError.CodeUserFieldInvalid)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckMail(email)).code == CodeError.CodeUserFieldInvalid)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckName(fn, "firstname")).code == CodeError.CodeUserFieldInvalid)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckName(ln, "lastname")).code == CodeError.CodeUserFieldInvalid)
            return (res.status(400).send(checkError));
        if ((pw == undefined && npw != undefined) || (pw != undefined && npw == undefined))
            return (res.status(400).send({request: "error", code: CodeError.CodeEditPassword, info: "Please set the 'password' and the 'new_password' or none of them"}));

        Auth.CheckAuth(req, res, function()
        {
            var db = req.db;
            var token = req.params.t;
            db.collection('user', function(err_collection, user_collection) {
                if (err_collection)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                else {
                    user_collection.find({auth_token: token} , function (error, account_res) {
                        if (error)
                            res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                        if (account_res === null)
                            res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
                        else
                        {
                            user_collection.findOne({auth_token: token, password: pw}, function (err_find, find_res) {
                                if (err_find)
                                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                else if (find_res === null)
                                    res.status(200).send({request: "error", code: CodeError.CodeBadPasswordEdit, info: "The password is incorrect."});
                                else {
                                    var update_user = {};
                                    if (email != undefined)
                                    {
                                        user_collection.findOne({auth_token: token, email : email}, function(err_findemail, email_res){
                                           if(err_findemail)
                                               res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                           else if (email_res != null)
                                               res.status(200).send({request: "error", code: CodeError.CodeEmailAlreadyUsed, info: "Email address '" + email + "' is already used by another user"});
                                        });
                                        update_user.email = email;
                                    }
                                    if (npw != undefined)
                                        update_user.password = npw;
                                    if (fn != undefined)
                                        update_user.firstname = fn;
                                    if (ln != undefined)
                                        update_user.lastname = ln;
                                    if (favorites != undefined)
                                        update_user.favorites = favorites;
                                    if (avatar != undefined)
                                        update_user.avatar = avatar;
                                    user_collection.update({ _id : find_res._id }, { $set : update_user }, function(err_update, user_updated) {
                                       if (err_update)
                                           res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                       else if (user_updated != 1)
                                           res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                       else
                                       {
                                           var new_user_updated = {};
                                           for (var _old in find_res)
                                               new_user_updated[_old] = find_res[_old];
                                           for (var _new in update_user)
                                               new_user_updated[_new] = update_user[_new];
                                           res.status(201).send({request: "success", user: new_user_updated});
                                       }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
});

/*
 *  Route to delete user
 *  Code:
 *      0 : Authentication OK
 */
// @TODO Manage delete avatar
router.delete('/:t', function(req, res) {
    Auth.CheckAuth(req, res, function()
    {
        var db = req.db;
        var token = req.params.t;
        db.collection('user', function(err_collection, user_collection) {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else {
                user_collection.find({ auth_token : token}, function (error, account_res) {
                    if (error)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    if (account_res === null)
                        res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
                    else
                    {
                        user_collection.removeById(account_res._id, function(err_del, res_del){
                            if (err_del)
                               res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else if (res_del != 1)
                               res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else
                                res.status(200).send("deleted");
                        });
                    }
                });
            }

        })
    });
});
// =========================================================================== OLD =============================================================================
///* GET users listing. */
//router.get('/', function(req, res) {
//    res.render('users', { title: 'Nourriture - Users' });
//});
//
///*
// * GET userlist.
// */
router.get('/accountlist', function(req, res) {
    var db = req.db;
    db.collection('user').find().toArray(function (err, items) {
        res.json(items);
    });
});
//
///*
// * GET Simple User
// */
//router.get('/accountid/:id', function(req, res) {
//    var db = req.db;
//    var userId = req.params.id;
//    db.collection('account').findById(userId, function(err, result) {
//        res.json(result);
//    });
//});
//
///*
// * POST to adduser.
// */
//router.post('/adduser', function(req, res) {
//    var db = req.db;
//    db.collection('account').insert(req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
///*
// * DELETE to deleteuser.
// */
//router.delete('/deleteuser/:id', function(req, res) {
//    var db = req.db;
//    var userToDelete = req.params.id;
//    db.collection('account').removeById(userToDelete, function(err, result) {
//        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
//    });
//});
//
///*
// *  EDIT a User
// */
//router.put('/editaccount/:id', function(req, res){
//    var db = req.db;
//    var userToEdit = req.params.id;
//    db.collection('account').updateById(userToEdit, req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});

// ============================================================================================================================================================
module.exports = router;
