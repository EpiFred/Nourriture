var express = require('express');
var router = express.Router();
var formidable = require('formidable');
// ===============================================================================================================================================
var protocol_login = /^(a-z|A-Z|0-9)[a-zA-Z0-9]+$/;
var protocol_mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    // 2nd test plus court....: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
var protocol_password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
/*
 *  Function that check if the login is correct
 *  Return code:
 *      0 : Everything is ok
 *      1001 : no field login defined
 *      1002 : login is empty
 *      1003 : not conform to the protocol login
 */
function CheckLogin(login)
{
    if (login === undefined)
        return ({code: 1001, info: "No field called 'login' in the data sent."});
    if (login.count == 0)
        return ({code: 1002, info: "Field 'login' not set in the form."});
    if (protocol_login.test(login))
        return ({code: 1003, info: "Field 'login' not conform to the login protocol"});
    return ({code: 0, info: "Login is OK"});
}

/*
 *  Function that check if the password is correct
 *  Return code:
 *      0 : Everything is ok
 *      1011 : No field password defined
 *      1012 : Password is empty
 *      1013 : Password is not conform to the protocol (should contain at least one digit,
 *                                                      should contain at least one lower case,
 *                                                      should contain at least one upper case,
 *                                                      should contain at least 8 from the mentioned characters)
 *
 */
function CheckPassword(passwd)
{
    if (passwd === undefined)
        return ({code: 1011, info: "No field called 'password' in the data sent."});
    if (passwd.count == 0)
        return ({code: 1012, info: "Field 'password' not set in the form."});
    if (!protocol_password.test(passwd))
        return ({code: 1013, info: "Field 'password' not conform to the password protocol"});
    return ({code: 0, info: "Password is OK"});
}

/*
 *  Function that check if the email address is correct
 *  Return code:
 *      0 : Everything is ok
 *      1021 : No field mail defined
 *      1022 : Mail is empty
 *      1023 : Mail is not conform to the protocol
 */
function CheckMail(mail)
{
    if (mail === undefined)
        return ({code: 1011, info: "No field called 'email' in the data sent."});
    if (mail.compare("") || mail.count == 0)
        return ({code: 1012, info: "Field 'email' not set in the form."});
    if (!protocol_mail.test(mail))
        return ({code: 1013, info: "Field 'email' not conform to the mail protocol"});
    return ({code: 0, info: "Mail is OK"});
}

// ===============================================================================================================================================

/*
 *  Route for login
 *  Code:
 *      0 : Authentication OK
 *      10X1 : Field missing
 *      10X2 : Field empty
 *      10X3 : Field not conform to the protocol
 *      10X4 : Bad Authentication
 *      9001 : DB Error
 *  TO DO Manage Token --> Handle other page the Token
 */
router.post('/login', function(req, res)
{
    var form = new formidable.IncomingForm();
    var checkError;

    form.parse(req, function(error, formInfos, files)
    {
        var login = formInfos.login;
        var pw = formInfos.password;

        if ((checkError = CheckLogin(login)).code != 0)
            return (res.send(checkError));
        if ((checkError = CheckPassword(pw)).code != 0)
            return (res.send(checkError));

        var db = req.db;
        db.collection("account").findOne({Login: login, Password: pw}, function(error, account_res)
        {
            if (error)
                return (res.send({code: 9001, info: "DB Error"}));
            if (account_res === null)
                res.send({code: 1004, info: "Bad Login or Bad Password"});
            else
                res.send({code: 0, info:"Authentication OK"});
        });
    });
});

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('users', { title: 'Nourriture - Users' });
});

/*
 * GET userlist.
 */
router.get('/accountlist', function(req, res) {
    var db = req.db;
    db.collection('account').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * GET Simple User
 */
router.get('/accountid/:id', function(req, res) {
    var db = req.db;
    var userId = req.params.id;
    db.collection('account').findById(userId, function(err, result) {
        res.json(result);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('account').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('account').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 *  EDIT a User
 */
router.put('/editaccount/:id', function(req, res){
    var db = req.db;
    var userToEdit = req.params.id;
    db.collection('account').updateById(userToEdit, req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});


// ============================================================================================================================================================
module.exports = router;
