/**
 * Created by Julian on 10/01/2015.
 */

var CodeError = require('./error_code.js');
// ===============================================================================================================================================

// ===============================================================================================================================================

function CheckErrorDB(err_db)
{
    if (err_db)
        return ({request:"error", code: CodeError.CodeDB, info: "DB Error"})
    else
        return ({code: 0});
}

function CheckDBUpdate(err, update)
{
    var CheckErr;
    if ((CheckErr = CheckErrorDB(err).code) != 0)
        return (CheckErr);
    if (update != 1)
        return ({request:"error", code: CodeError.CodeDB, info: "DB Error"})
    return ({code: 0});
}

function CheckDBInsert(err, insert)
{
    var CheckErr;
    if ((CheckErr = CheckErrorDB(err).code) != 0)
        return (CheckErr);
    if (insert == null)
        return ({request:"error", code: CodeError.CodeDB, info: "DB Error"})
    return ({code: 0});
}

function CheckDBDelete(err, del)
{
    var CheckErr;
    if ((CheckErr = CheckErrorDB(err).code) != 0)
        return (CheckErr);
    if (del != 1)
        return ({request:"error", code: CodeError.CodeDB, info: "DB Error"})
    return ({code: 0});
}
// ===============================================================================================================================================
exports.CheckErrorDB = CheckErrorDB;
exports.CheckDBUpdate = CheckDBUpdate;
exports.CheckDBInsert = CheckDBInsert;
exports.CheckDBDelete = CheckDBDelete;
