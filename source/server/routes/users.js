var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var md5 = require('MD5');
var fs = require('fs');
var UserControl = require('../lib/users_control.js');
var CodeError = require('../lib/error_code.js');
var Auth = require('../lib/auth_control.js');
// ====================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

// ====================================================================================================================================
// ====================================================================================================================================
router.get('/list', function(req, res) {
    var db = req.db;
    db.collection('user').find({}, {auth_token: false}).toArray(function (err, items) {
        if (err) {
            console.log("Error while retrieving user list: " + err);
            res.status(500).json({"request": "error"});
        }
        res.json({"request": "success", "users": items});
    });
});

// ====================================================================================================================================
/*
 *  Route for login
 *  Code:
 *      0 : Authentication OK
 *      201 : Field missing
 *      202 : Field invalid
 *      CodeLogin : Bad Authentication
 *      CodeDB : DB Error
 *  TO DO Manage Token --> Handle other page the Token
 */
router.post('/login', function(req, res) {
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function (error, formInfos, files) {
        var login = formInfos.pseudo;
        var pw = formInfos.password;

        if ((checkError = UserControl.CheckLogin(login)).code != 0)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckPassword(pw)).code != 0)
            return (res.status(400).send(checkError));

        var db = req.db;
        db.collection("user", function (err_collection, user_collection) {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else {
                user_collection.findOne({pseudo: login, password: pw}, function (err_find, find_res) {
                    console.log(login + " - " + pw);
                    if (err_find)
                        res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
                    else if (find_res == null)
                        res.status(200).send({request: "error", code: CodeError.CodeBadLogin, info: "Invalid credentials."});
                    else {
                        var date = new Date;
                        var token = md5(Math.floor(date.getTime()));
                        //console.log(token);
                        if (find_res.auth_token)
                            delete find_res.auth_token;

                        user_collection.update( {_id : find_res._id}, { $set: {auth_token:token}} , function(err_update, field_updated) {
                            if (err_update)
                                res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
                            else if (field_updated === null)
                                res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
                            else
                                res.status(201).send({request: "success", token: token, user: find_res});
                        });
                    }
                });
            }
        });
    });
});

/*
 *  Endpoint to get an user info
 *  Code:
 *      0 : Authentication OK
 */
router.get('/:id', function(req, res) {
    Auth.CheckAuth(req, res, function()
    {
        var idUser = req.params.id;
        var token = req.query.t;
        if (!(CheckBson.test(idUser)))
            res.status(404).send({request: "error", code: CodeError.CodeUserIdNotFound,info: "User could not be found."});
        var db = req.db;
        db.collection('user').findById(idUser, function (error, account_res)
        {
            if (error)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            if (account_res === null)
                res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
            else
            if (account_res.auth_token === token)
                res.status(200).send({request: "success", user: account_res});
            else
            {
                delete account_res.auth_token;
                delete account_res.password;
                res.status(200).send({request: "success", user: account_res});
            }
        });
    });
});

/*
 *  Create an User
 *  Code:
 *      0 : Authentication OK
 */
router.post('/', function(req, res) {
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function (error, formInfos, files)
    {
        var login = formInfos.pseudo;
        var pw = formInfos.password;
        var fn = formInfos.firstname;
        var ln = formInfos.lastname;
        var email = formInfos.email;
        var avatar = files.avatar;

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
        checkError = UserControl.CheckPicture(avatar);
        if (!(checkError.code == 0 || checkError.code == CodeError.CodeFoodFieldMissing))
            return (res.status(400).send(checkError));

        var db = req.db;
        db.collection("user", function (err_collection, user_collection)
        {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else
            {
                user_collection.findOne({ $or: [{pseudo: login},{email: email}]}, function(err_find, find_res)
                {
                    if (err_find)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    else if (find_res != null)
                    {
                        if (find_res.pseudo == login)
                            res.status(200).send({request: "error", code: CodeError.CodeUserAlreadyExist, info: "Pseudo '" + login + "' is already used by another user"});
                        else if (find_res.email == email)
                            res.status(200).send({request: "error", code: CodeError.CodeUserAlreadyExist, info: "Email address '" + email + "' is already used by another user"});
                    }
                    else
                    {
                        var new_user = {pseudo: login, password: pw, firstname: fn, lastname: ln, email: email};
                        user_collection.insert(new_user, function(err_insert, insert_res)
                        {
                            if (err_insert)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else if (insert_res == null)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else
                            {
                                var micro_update_user = {};
                                if (avatar != undefined)
                                {
                                    var new_picture_url = UserControl.GetNewPictureName(avatar.name, insert_res[0]._id).url;
                                    fs.rename(avatar.path, new_picture_url, function (err_rename)
                                    {
                                        if (err_rename)
                                            return (res.status(CodeError.StatusPermissionFile).send({request: "error", code: CodeError.CodePermissionFile, message: "Can't save the file"}));
                                    });
                                    micro_update_user.avatar = new_picture_url;
                                }
                                var date = new Date;
                                var token = md5(Math.floor(date.getTime()));
                                micro_update_user.auth_token = token;

                                user_collection.update({_id: insert_res[0]._id}, {$set: micro_update_user}, function (err_update, field_updated)
                                {
                                    if (err_update)
                                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error" + err_update});
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
 *  Edit an User
 *  Code:
 *      0 : Authentication OK
 */
router.put('/', function(req, res) {
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function (error, formInfos, files)
    {
        if (Object.keys(formInfos).length == 0 && Object.keys(files).length == 0)
            return (res.status(400).send({request: "error", code: CodeError.CodeUserEditNothing, message: "Nothing to update."}));
        var pw = formInfos.password;
        var npw = formInfos.new_password;
        var fn = formInfos.firstname;
        var ln = formInfos.lastname;
        var email = formInfos.email;
        var favorites = formInfos.favorites;
        var avatar = files.avatar;

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
        checkError = UserControl.CheckPicture(avatar);
        if (!(checkError.code == 0 || checkError.code == CodeError.CodeFoodFieldMissing))
            return (res.status(400).send(checkError));

        if ((pw == undefined && npw != undefined) || (pw != undefined && npw == undefined))
            return (res.status(400).send({request: "error", code: CodeError.CodeEditPassword, info: "Please set the 'password' and the 'new_password' or none of them"}));

        Auth.CheckAuth(req, res, function()
        {
            var db = req.db;
            var token = req.query.t;
            db.collection('user', function(err_collection, user_collection) {
                if (err_collection)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                else
                {
                    user_collection.findOne({auth_token: token} , function (error, account_res)
                    {
                        if (error)
                            res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                        if (account_res === null)
                            res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
                        else
                        {
                            var update_user = {};
                            if (npw != undefined)
                            {
                                user_collection.findOne({auth_token: token, password: pw}, function (err_find, find_res) {
                                    if (err_find)
                                        return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
                                    else if (find_res === null)
                                        return (res.status(200).send({request: "error", code: CodeError.CodeBadPasswordEdit, info: "The password is incorrect."}));
                                    else
                                        update_user.password = npw;
                                });
                            }
                            if (email != undefined)
                            {
                                user_collection.findOne({auth_token: token, email : email}, function(err_findemail, email_res)
                                {
                                    if(err_findemail)
                                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                    else if (email_res != null)
                                        res.status(200).send({request: "error", code: CodeError.CodeEmailAlreadyUsed, info: "Email address '" + email + "' is already used by another user"});
                                });
                                update_user.email = email;
                            }
                            if (fn != undefined)
                                update_user.firstname = fn;
                            if (ln != undefined)
                                update_user.lastname = ln;
                            if (favorites != undefined)
                                update_user.favorites = favorites;
                            if (avatar != undefined)
                            {
                                var new_picture_url = UserControl.GetNewPictureName(avatar.name, account_res._id).url;
                                if (typeof account_res.avatar == "string")
                                    fs.unlink(account_res.avatar);
                                fs.rename(avatar.path, new_picture_url, function (err_rename)
                                {
                                    if (err_rename)
                                        return (res.status(CodeError.StatusPermissionFile).send({request: "error", code: CodeError.CodePermissionFile, message: "Can't save the file"}));
                                });
                                update_user.avatar = new_picture_url;
                            }
                            user_collection.update({ _id : account_res._id }, { $set : update_user }, function(err_update, user_updated)
                            {
                                if (err_update)
                                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                else if (user_updated != 1)
                                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                else
                                {
                                    var new_user_updated = {};
                                    for (var _old in account_res)
                                        new_user_updated[_old] = account_res[_old];
                                    for (var _new in update_user)
                                        new_user_updated[_new] = update_user[_new];
                                    res.status(200).send({request: "success", user: new_user_updated});
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
router.delete('/', function(req, res) {
    Auth.CheckAuth(req, res, function()
    {
        var db = req.db;
        var token = req.query.t;
        db.collection('user', function(err_collection, user_collection)
        {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else
            {                user_collection.findOne({ auth_token : token}, function (error, account_res)
            {
                if (error)
                    res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                if (account_res === null)
                    res.status(404).send({ request: "error", code: CodeError.CodeUserIdNotFound, info: "User could not be found." });
                else
                {
                    user_collection.remove({ _id : account_res._id }, function(err_del, res_del)
                    {
                        if (err_del)
                            res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                        else if (res_del != 1)
                            res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                        else
                        {
                            if (typeof account_res.avatar == "string")
                                fs.unlink(account_res.avatar);
                            res.status(200).send({request: "success", message: "deleted"});
                        }
                    });
                }
            });
            }
        });
    });
});

router.post('/favorite', function(req, res){
    Auth.CheckAuth(req, res, function(){
        var token = req.query.t;
        var db = req.db;
        var form = new formidable.IncomingForm();

        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log("Formidable form parse error: " + err);
                res.status(500).json({"request": "error"});
            }
            else {

                // Validate request
                var recipeId = fields.recipe_id;

                if (typeof recipeId === "undefined")
                    res.status(400).json({"request": "error", "code": CodeError.CodeUserFieldMissing, "message": "The field 'recipe_id' is mandatory and has not been specified."});
                else if (recipeId === null || (/^\s*$/).test(recipeId))
                    res.status(400).json({"request": "error", "code": CodeError.CodeUserFieldInvalid, "message": "The field 'recipe_id' is invalid."});
                else {

                    // Validate recipe existence
                    db.collection("recipes").findById(recipeId, function (err, recipe) {
                        if (err) {
                            console.log(err);
                            res.status(500).json({"request": "error"});
                        }
                        else if (!recipe)
                            res.status(200).json({"request": "error", "code": 211, "message": "Recipe could not be found."});
                        else {

                            // Check for duplicate
                            db.collection("user").find({auth_token: token}, {}).toArray(function(err, users) {
                                if (err) {
                                    console.log("Error while searching user: " + err);
                                    res.status(500).json({"request": "error"});
                                }
                                else if (users.length == 0)
                                    res.status(500).json({"request": "error"});
                                else if (users[0].favorites.indexOf(recipeId) > -1)
                                    res.status(400).json({"request": "error", "code": 212, "message": "Recipe is already in favorites."});
                                else {

                                    // Update favorites
                                    db.collection("user").update({auth_token: token}, {$push: {favorites: recipeId}}, function(err, count, status) {
                                        if (err) {
                                            console.log("Favorites update error: " + err);
                                            res.status(500).json({"request": "error"});
                                        }
                                        else if (count == 0)
                                            res.status(500).json({"request": "error"});
                                        else
                                            res.status(200).json({"request": "success"});
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    });
});

router.delete('/favorite/:id', function(req, res) {
    Auth.CheckAuth(req, res, function() {
        var token = req.query.t;
        var db = req.db;
        var favoriteId = req.params.id;

        // Retrieve user
        db.collection("user").find({auth_token: token}, {}).toArray(function(err, users) {
            if (err) {
                console.log("Error while searching user: " + err);
                res.status(500).json({"request": "error"});
            }
            else if (users.length == 0)
                res.status(500).json({"request": "error"});
            else {

                var user = users[0];

                // Check favorite
                if (typeof user.favorites === "undefined" ||
                    user.favorites === null ||
                    user.favorites.length == 0)
                    res.status(400).json({"request": "error", "code": 211, "message": "Favorite could not be found."});
                else {

                    // Remove favorite
                    var index = user.favorites.indexOf(favoriteId);

                    if (index == -1)
                        res.status(400).json({"request": "error", "code": 211, "message": "Favorite could not be found."});
                    else {
                        user.favorites.splice(index, 1);

                        // Safety check
                        while ((index = user.favorites.indexOf(favoriteId)) != -1) {
                            user.favorites.splice(index, 1);
                        }

                        // Update user
                        db.collection("user").updateById(user._id, {$set: {favorites: user.favorites}}, function(err, count, status) {
                            if (err) {
                                console.log("Favorites update error: " + err);
                                res.status(500).json({"request": "error"});
                            }
                            else if (count == 0)
                                res.status(500).json({"request": "error"});
                            else
                                res.status(200).json({"request": "success"});
                        });
                    }
                }
            }
        });
    });
});

module.exports = router;
