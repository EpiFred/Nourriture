/**
 * Created by Julian on 07/01/2015.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var md5 = require('MD5');
var UserControl = require('../public/javascripts/users_control.js');
var CodeError = require('../public/javascripts/error_code.js');
// ====================================================================================================================================

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
router.post('/', function(req, res) {
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
                res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
            else {
                user_collection.findOne({pseudo: login, password: pw}, function (err_find, find_res) {
                    if (err_find)
                        res.status(CodeError.StatusDB).send({code: CodeError.CodeDB, info: "DB Error"});
                    else if (find_res === null)
                        res.status(200).send({request: "error", code: CodeError.CodeBadLogin, info: "Invalid credentials."});
                    else {
                        var date = new Date;
                        var token = md5(Math.floor(date.getTime()));
                        //console.log(token);

                        user_collection.update( {_id : find_res._id}, { $set: {"auth_token":token}} , function(err_update, field_updated) {
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

// ============================================================================================================================================================
module.exports = router;
