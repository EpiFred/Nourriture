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
var base_url = "./";
var image_dir_url = base_url + "public/images/users/";

// ===============================================================================================================================================
/*
 *  Function that check if the login is correct
 *  Return code:
 *      0 : Everything is ok
 *      CodeUserFieldMissing : no field login defined
 *      CodeUserFieldInvalid : login is empty
 */
function CheckLogin(login)
{
    if (login === undefined)
        return ({request: "error", code: CodeError.CodeUserFieldMissing, message: "The field 'pseudo' is mandatory and has not been specified."});
    if (login == "")
        return ({request: "error", code: CodeError.CodeUserFieldInvalid, message: "The field 'pseudo' is invalid"});
    //if (protocol_login.test(login))
    //    return ({code: 1003, message: "Field 'login' not conform to the login protocol"});
    return ({code: 0, message: "Login is OK"});
}

/*
 *  Function that check if the password is correct
 *  Return code:
 *      0 : Everything is ok
 *      CodeUserFieldMissing : No field password defined
 *      CodeUserFieldInvalid : Password is empty
 */
function CheckPassword(passwd)
{
    if (passwd === undefined)
        return ({request: "error", code: CodeError.CodeUserFieldMissing, message: "The field 'password' is mandatory and has not been specified."});
    if (passwd == "")
        return ({request: "error", code: CodeError.CodeUserFieldInvalid, message: "The field 'password' is invalid"});
    //if (!protocol_password.test(passwd))
    //    return ({code: 1013, message: "Field 'password' not conform to the password protocol"});
    return ({code: 0, message: "Password is OK"});
}

/*
 *  Function that check if the email address is correct
 *  Return code:
 *      0 : Everything is ok
 *      CodeUserFieldMissing : No field mail defined
 *      CodeUserFieldInvalid : Mail is empty
 */
function CheckMail(mail)
{
    if (mail === undefined)
        return ({request: "error", code: CodeError.CodeUserFieldMissing, message: "The field 'email' is mandatory and has not been specified."});
    if (mail == "")
        return ({request: "error", code: CodeError.CodeUserFieldInvalid, message: "The field 'email' is invalid"});
    if (protocol_mail.test(mail))
        return ({request: "error", code: CodeError.CodeSyntaxEmail, message: "Syntax of email '" + mail + "' is invalid"});
    return ({code: 0, message: "Mail is OK"});
}

/*
 *  Function that check if the firstname or lastname is ok
 *  Return code:
 *      0 : Everything is ok
 *      CodeUserFieldMissing : no field firstname or lastname defined
 *      CodeUserFieldInvalid : firstname or lastname is empty
 */
function CheckName(name, type)
{
    if (name === undefined)
        return ({request: "error", code: CodeError.CodeUserFieldMissing, message: "The field '" + type + "' is mandatory and has not been specified."});
    if (name == "")
        return ({request: "error", code: CodeError.CodeUserFieldInvalid, message: "The field '" + type + "' is invalid"});
    return ({code: 0, message:  type + " is OK"});
}


function CheckPicture(picture)
{
    if (picture === undefined)
        return ({request: "error", code: CodeError.CodeFoodFieldMissing, message: "The field 'avatar' is mandatory and has not been specified."});
    if (picture.path == "")
        return ({request: "error", code: CodeError.CodeNoSuchFile, message: "No such file '"+ picture.path +"'."});
    if (picture.type.indexOf("image") != 0)
        return ({request: "error", code: CodeError.CodeNotAnImage, message: "The file uploaded must be an image."});
    return ({code: 0, message: "Everything is OK"});
}

function GetNewPictureName(pictureName, id)
{
    var tmp;
    var ext = ((tmp = (pictureName).lastIndexOf(".")) != -1) ? (pictureName).substr(tmp) : ".tmp";
    var new_picture_url = image_dir_url  + id + ext;
    return ({url: new_picture_url});
}

// ===============================================================================================================================================
exports.CheckLogin = CheckLogin;
exports.CheckPassword = CheckPassword;
exports.CheckMail = CheckMail;
exports.CheckName = CheckName;
exports.CheckPicture = CheckPicture;
exports.GetNewPictureName = GetNewPictureName;
