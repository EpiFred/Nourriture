/**
 * Created by Julian on 08/01/2015.
 */

var errorCodes = require('./error_code.js');
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
// ===============================================================================================================================================
var base_url = "./";
var image_dir_url = base_url + "public/images/recipes/";
// ===============================================================================================================================================

function CheckFieldCreate(field, type)
{
    if (field === undefined)
        return ({request: "error", code: errorCodes.recipes.missingField, message: "The field '" + type + "' is mandatory and has not been specified."});
    if (field == "")
        return ({request: "error", code: errorCodes.recipes.invalidField, message: "The field '" + type + "' is invalid"});
    return ({code: 0, message:  type + " is OK"});
}

function CheckIngredientListIntegrity(ingredientList)
{
    for (var i = 0; i < ingredientList.length; i++)
    {
        if (!(ingredientList[i].hasOwnProperty("id")))
            return ({request: "error", code:  errorCodes.recipes.invalidFoodsList, message: "List of foods is invalid. The field 'id' is not set."});
        if (!(ingredientList[i].hasOwnProperty("name")))
            return ({request: "error", code:  errorCodes.recipes.invalidFoodsList, message: "List of foods is invalid. The field 'name' is not set."});
        if (!(ingredientList[i].hasOwnProperty("detail")))
            return ({request: "error", code:  errorCodes.recipes.invalidFoodsList, message: "List of foods is invalid. The field 'detail' is not set."});
        for (var _obj in ingredientList[i])
        {
            if (_obj != "id" && _obj != "name" && _obj != "detail")
                return ({request: "error", code:  errorCodes.recipes.invalidFoodsList, message: "List of foods is invalid. The field '"+ _obj +"'is not asked."});
            if ((_obj == "id" && ingredientList[i][_obj] == "") || (_obj == "name" && ingredientList[i][_obj] == "") || (_obj == "detail" && ingredientList[i][_obj] == ""))
                return ({request: "error", code:  errorCodes.recipes.invalidFoodsList, message: "List of foods is invalid. The field '"+ _obj +"'is empty."});
        }
    }
    return ({request: "success"});
}


function CheckIngredientsList(ingredientList, req, res, next)
{
    var err;
    if (ingredientList === undefined)
        return (res.status(400).send({request: "error", code: errorCodes.recipes.missingField, message: "The field 'foods' is mandatory and has not been specified."}));
    else if (Object.keys(ingredientList).length == 0)
        return (res.status(400).send({request: "error", code: errorCodes.recipes.createNoFood, message: "The field 'foods' can't be empty."}));
    if ((err = CheckIngredientListIntegrity(ingredientList)).request != "success")
        return (res.status(400).send(err));

    var db = req.db;
    db.collection('food', function(err_collection, food_collection) {
        if (err_collection)
            return (res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"}));
        else
        {
            for (var i = 0; i < ingredientList.length; i++)
            {
                (function(i) {
                    food_collection.findOne({_id: new BSON.ObjectID(ingredientList[i].id)}, function(err_find, food_found)
                    {
                        if (err_find)
                            return (res.status(errorCodes.api.statusDB).send({request:"error", code: errorCodes.undetermined.codeDB, info: "DB Error"}));
                        else if (food_found == null)
                            return (res.status(404).send({request: "error", code: errorCodes.recipes.foodDoesNotExist, message: "The id of the food '"+ ingredientList[i].name +"' does not exist."}));
                        else
                        if (ingredientList[i].name != food_found.name)
                            return (res.status(400).send({request: "error", code: errorCodes.recipes.foodsNameDoesNotMatch, message: "The 'name' of the food '"+ ingredientList[i].name +"' does not match with the name in db '"+ food_found.name +"'."}));
                    });
                })(i);
            }
            next();
        }
    });
}

function CheckPicture(picture)
{
    if (picture === undefined)
        return ({request: "error", code: errorCodes.food.missingField, message: "The field 'picture' is mandatory and has not been specified."});
    if (picture.path == "")
        return ({request: "error", code: errorCodes.api.noSuchFile, message: "No such file '"+ picture.path +"'."});
    if (picture.type.indexOf("image") != 0)
        return ({request: "error", code: errorCodes.api.notAnImage, message: "The file uploaded must be an image."});
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
exports.CheckIngredientsList = CheckIngredientsList;
exports.CheckPicture = CheckPicture;
exports.GetNewPictureName = GetNewPictureName;