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
        if (!(CheckBson.test(idUser)))
            res.status(404).send({request: "error", code: CodeError.CodeUserIdNotFound,info: "User could not be found."});
        var db = req.db;
        db.collection('user').findById(idUser, function (error, account_res) {
            if (error)
                res.status(CodeError.StatusDB).send({code: CodeError.CodeCodeDB, info: "DB Error"});
            if (account_res === null)
                res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
            else
                if (account_res.auth_token === req.params.t)
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
 *  Route for login
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
                res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
            else {
                user_collection.findOne({ $or: [{pseudo: login},{email: email}]}, function(err_find, find_res) {
                    if (err_find)
                        res.status(CodeError.StatusDB).send({code: CodeError.CodeCodeDB, info: "DB Error"});
                    else if (find_res != null) {
                        if (find_res.pseudo == login)
                            res.status(200).send({request: "error", code: CodeError.CodeUserAlreadyExist, info: "Pseudo '" + login + "' is already used by another user"});
                        else if (find_res.email == email)
                            res.status(200).send({request: "error", code: CodeError.CodeUserAlreadyExist, info: "Email address '" + email + "' is already used by another user"});
                    }
                    else{
                        user_collection.insert(formInfos, function(err_insert, insert_res) {
                            if (err_insert)
                                res.status(CodeError.StatusDB).send({code: CodeError.CodeCodeDB, info: "DB Error"});
                            else if (insert_res == null)
                                res.status(CodeError.StatusDB).send({code: CodeError.CodeCodeDB, info: "DB Error"});
                            else {
                                var date = new Date;
                                var token = md5(Math.floor(date.getTime()));

                                user_collection.update({_id: insert_res._id}, {$set: {"auth_token": token}}, function (err_update, field_updated) {
                                    if (err_update)
                                        res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
                                    else if (field_updated === null)
                                        res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
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
 *  Route for login
 *  Code:
 *      0 : Authentication OK
 *      201 : Field missing
 *      202 : Field invalid
 *      10X3 : Field not conform to the protocol
 *      CodeLogin : Bad Authentication
 *      CodeDB : DB Error
 *  TO DO Manage Token --> Handle other page the Token
 */
router.put('/', function(req, res)
{
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
