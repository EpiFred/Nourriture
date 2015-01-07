/**
 * Created by Julian on 07/01/2015.
 */

var CodeError = require('./error_code.js');
// ===============================================================================================================================================
var protocol_login = /^[a-zA-Z0-9]+$/;
//var protocol_mail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var protocol_mail = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
var protocol_password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
// ===============================================================================================================================================

// ===============================================================================================================================================
/*
 *  Function that check if the login is correct
 *  Return code:
 *      0 : Everything is ok
 *      CodeFieldMissing : no field login defined
 *      CodeFieldInvalid : login is empty
 */
function CheckLogin(login)
{
    if (login === undefined)
        return ({request: "error", code: CodeError.CodeFieldMissing, message: "The field 'login' is mandatory and has not been specified."});
    if (login == "")
        return ({request: "error", code: CodeError.CodeFieldInvalid, message: "The field 'login' is invalid"});
    //if (protocol_login.test(login))
    //    return ({code: 1003, message: "Field 'login' not conform to the login protocol"});
    return ({code: 0, message: "Login is OK"});
}

/*
 *  Function that check if the password is correct
 *  Return code:
 *      0 : Everything is ok
 *      CodeFieldMissing : No field password defined
 *      CodeFieldInvalid : Password is empty
 */
function CheckPassword(passwd)
{
    if (passwd === undefined)
        return ({request: "error", code: CodeError.CodeFieldMissing, message: "The field 'password' is mandatory and has not been specified."});
    if (passwd == "")
        return ({request: "error", code: CodeError.CodeFieldInvalid, message: "The field 'password' is invalid"});
    //if (!protocol_password.test(passwd))
    //    return ({code: 1013, message: "Field 'password' not conform to the password protocol"});
    return ({code: 0, message: "Password is OK"});
}

/*
 *  Function that check if the email address is correct
 *  Return code:
 *      0 : Everything is ok
 *      CodeFieldMissing : No field mail defined
 *      CodeFieldInvalid : Mail is empty
 */
function CheckMail(mail)
{
    if (mail === undefined)
        return ({request: "error", code: CodeError.CodeFieldMissing, message: "The field 'email' is mandatory and has not been specified."});
    if (mail == "")
        return ({request: "error", code: CodeError.CodeFieldInvalid, message: "The field 'email' is invalid"});
    if (protocol_mail.test(mail))
        return ({request: "error", code: CodeError.CodeSyntaxEmail, message: "Syntax of email '" + mail + "' is invalid"});
    return ({code: 0, message: "Mail is OK"});
}

/*
 *  Function that check if the firstname or lastname is ok
 *  Return code:
 *      0 : Everything is ok
 *      CodeFieldMissing : no field firstname or lastname defined
 *      CodeFieldInvalid : firstname or lastname is empty
 */
function CheckName(name, type)
{
    if (name === undefined)
        return ({request: "error", code: CodeError.CodeFieldMissing, message: "The field '" + type + "' is mandatory and has not been specified."});
    if (name == "")
        return ({request: "error", code: CodeError.CodeFieldInvalid, message: "The field '" + type + "' is invalid"});
    return ({code: 0, message:  type + " is OK"});
}
// ===============================================================================================================================================
exports.CheckLogin = CheckLogin;
exports.CheckPassword = CheckPassword;
exports.CheckMail = CheckMail;
exports.CheckName = CheckName;
