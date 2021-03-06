/**
 * Created by Julian on 07/01/2015.
 */


var errorCodes = require('./error_code.js');
// ===============================================================================================================================================

// ===============================================================================================================================================
/*
 *  Function that check if the user is authenticate
 *  Return code:
 *      0 : Everything is ok
 *      CodeUnauthorized : No parameter for the token 't'
 *      CodeExpiredToken : Token invalid maybe relogin
 */
function CheckAuth(req, res, next)
{
    var token = req.query.t;
    //console.log(token);
    if (token === undefined)
        res.status(401).send({request: "error", code: errorCodes.api.unauthorized, message: "You must be authenticated in order to access to this resource."});
    if (token.count == 0)
        res.status(401).send({request: "error", code: errorCodes.api.expiredToken, message: "The authentication token has expired"});
    req.db.collection('user').findOne({auth_token: token}, function (err_find, user_res) {
        if (err_find)
            res.status(401).send({request: "error", code: errorCodes.undetermined.codeDB, message: "DB Error"});
        else if (user_res == null)
            res.status(401).send({request: "error", code: errorCodes.api.expiredToken, message: "The authentication token has expired"});
        else
            next();
    });
}

exports.CheckAuth = CheckAuth;