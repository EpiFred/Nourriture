/**
 * Created by Julian on 13/01/2015.
 */

var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var CodeError = require('../lib/error_code.js');
var Auth = require('../lib/auth_control.js');
var SearchControl = require('../lib/search_control.js');
// ===============================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

// ===============================================================================================================================================
/*
 * Search 
 * Code:
 *      0 : All Clear
 */
router.post('/', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var searching = formInfos.value;
            var type = formInfos.type;

            if (type != undefined)
                if (type != "")
                    if (/^[\],:{}\s]*$/.test(type.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                        type = JSON.parse(formInfos.type);
                    else
                        return (res.status(400).send({request: "error", code: CodeError.CodeFoodFieldInvalid, message: "The field 'type' is invalid. Not the format of a JSON"}));
                else
                    return (res.status(400).send({request: "error", code: CodeError.CodeSearchFieldInvalid, message: "The field 'type' is invalid"}));
            else
                return (SearchControl.SearchAll(searching, req, res));

            var u_want = {foods : 0, recipes : 0, users : 0};
            for (var i = 0; i < type.length; i++)
            {
                if (type[i].type)
                {
                    if (type[i].type == "foods")
                        u_want.foods = 1;
                    if (type[i].type == "users")
                        u_want.users = 1;
                    if (type[i].type == "recipes")
                        u_want.recipes = 1;
                }
            }
           if ((u_want.users == 1 && u_want.foods == 1 && u_want.recipes == 1) || (u_want.users == 0 && u_want.foods == 0 && u_want.recipes == 0))
               SearchControl.SearchAll(searching, req, res);
           else if (u_want.users == 1 && u_want.foods == 1 && u_want.recipes == 0)
               SearchControl.SearchUF(searching, req, res);
           else if ( u_want.users == 1 && u_want.foods == 0 && u_want.recipes == 1)
               SearchControl.SearchUR(searching, req, res);
           else if (u_want.users == 0 && u_want.foods == 1 && u_want.recipes == 1)
               SearchControl.SearchRF(searching, req, res);
           else if (u_want.users == 1 && u_want.foods == 0 && u_want.recipes == 0)
               SearchControl.SearchUsers(searching, req, res, function(users_list) {
                   res.status(200).send({request: "success", users: users_list});
               });
           else if (u_want.users == 0 && u_want.foods == 1 && u_want.recipes == 0)
               SearchControl.SearchFoods(searching, req, res, function(foods_list) {
                   res.status(200).send({request: "success", foods: foods_list});
               });
           else if (u_want.users == 0 && u_want.foods == 0 && u_want.recipes == 1)
               SearchControl.SearchRecipes(searching, req, res, function(recipes_list) {
                   res.status(200).send({request: "success", recipes: recipes_list});
               });
           else
               res.status(500).send({request:"error"});
        });
    });
});
// ===============================================================================================================================================
module.exports = router;