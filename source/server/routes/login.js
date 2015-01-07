/**
 * Created by Julian on 07/01/2015.
 */
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var UserControl = require('../public/javascripts/users_control.js');
// ====================================================================================================================================
var CodeDB = 1;
var CodeLogin = 203;
// ====================================================================================================================================
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
router.post('/', function(req, res) {
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function (error, formInfos, files) {
        var login = formInfos.login;
        var pw = formInfos.password;

        if ((checkError = UserControl.CheckLogin(login)).code != 0)
            return (res.status(400).send(checkError));
        if ((checkError = UserControl.CheckPassword(pw)).code != 0)
            return (res.status(400).send(checkError));

        var db = req.db;
        db.collection("user").findOne({pseudo: login, password: pw}, function (error, account_res) {
            if (error)
                return (res.status(0).send({code: CodeDB, info: "DB Error"}));
            if (account_res === null)
                res.status(200).send({request: "error", code: CodeLogin, info: "Invalid credentials."});
            else
                res.status(201).send({request: "success", token: "", user: account_res});
        });
    });
});

// ============================================================================================================================================================
module.exports = router;
