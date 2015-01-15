/**
 * Created by Julian on 09/01/2015.
 */

var CodeError = require('./error_code.js');
// ===============================================================================================================================================
var base_url = "./";
var image_dir_url = base_url + "public/images/foods/";
// ===============================================================================================================================================
function CheckFieldCreate(field, type)
{
    if (field === undefined)
        return ({request: "error", code: CodeError.CodeFoodFieldMissing, message: "The field '" + type + "' is mandatory and has not been specified."});
    if (field == "")
        return ({request: "error", code: CodeError.CodeFoodFieldInvalid, message: "The field '" + type + "' is invalid"});
    return ({code: 0, message:  type + " is OK"});
}

function CheckPicture(picture)
{
    if (picture === undefined)
        return ({request: "error", code: CodeError.CodeFoodFieldMissing, message: "The field 'picture' is mandatory and has not been specified."});
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
exports.CheckFieldCreate = CheckFieldCreate;
exports.CheckPicture = CheckPicture;
exports.GetNewPictureName = GetNewPictureName;