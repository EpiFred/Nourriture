/**
 * Created by Julian on 09/01/2015.
 */

var CodeError = require('./error_code.js');
// ===============================================================================================================================================

// ===============================================================================================================================================

function CheckFieldCreate(field, type)
{
    if (field === undefined)
        return ({request: "error", code: CodeError.CodeFoodFieldMissing, message: "The field '" + type + "' is mandatory and has not been specified."});
    if (field == "")
        return ({request: "error", code: CodeError.CodeFoodFieldInvalid, message: "The field '" + type + "' is invalid"});
    return ({code: 0, message:  type + " is OK"});
}

// ===============================================================================================================================================
exports.CheckFieldCreate = CheckFieldCreate;