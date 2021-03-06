/**
 * Created by Julian on 13/01/2015.
 */

var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var errorCodes = require('../lib/error_code.js');
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
                if (type != "") {
                    try {
                        if (/^[\],:{}\s]*$/.test(type.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                            type = JSON.parse(formInfos.type);
                        else
                            return (res.status(400).send({request: "error", code: errorCodes.food.invalidField, message: "The field 'type' is invalid. Not the format of a JSON. Ex:[{\"type\":\"foods\"}]"}));
                    } catch(e) {
                        return (res.status(400).send({request: "error", code: errorCodes.food.invalidField, message: "The field 'type' is invalid. Not the format of a JSON. Ex:[{\"type\":\"foods\"}]"}));
                    }
                }
                else
                    return (res.status(400).send({request: "error", code: errorCodes.search.invalidField, message: "The field 'type' is invalid. Ex:[{\"type\":\"foods\"}]"}));
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

/*
 * Search
 * Code:
 *      0 : All Clear
 */
router.post('/v2', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var searching = formInfos.value;
            var type = formInfos.type;
            var maxPerPage = formInfos.max;
            var pageNumber = formInfos.page;

            if (!(maxPerPage != undefined && maxPerPage != 0 && isNaN(maxPerPage) == false))
                maxPerPage = 0;
            else
                maxPerPage = Math.abs(maxPerPage);
            if (!(pageNumber != undefined && pageNumber != 0 && isNaN(pageNumber) == false))
                pageNumber = 1;
            else
                pageNumber = Math.abs(pageNumber);

            if (type != undefined)
                if (type != "") {
                    try {
                        if (/^[\],:{}\s]*$/.test(type.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                            type = JSON.parse(formInfos.type);
                        else
                            return (res.status(400).send({request: "error", code: errorCodes.food.invalidField, message: "The field 'type' is invalid. Not the format of a JSON. Ex:[{\"type\":\"foods\"}]"}));
                    } catch(e) {
                        return (res.status(400).send({request: "error", code: errorCodes.food.invalidField, message: "The field 'type' is invalid. Not the format of a JSON. Ex:[{\"type\":\"foods\"}]"}));
                    }
                }
                else
                    return (res.status(400).send({request: "error", code: errorCodes.search.invalidField, message: "The field 'type' is invalid. Ex:[{\"type\":\"foods\"}]"}));
            else
                return (SearchControl.SearchAllv2(searching, req, res, maxPerPage, pageNumber));


            var u_want = {foods : 0, recipes : 0, users : 0};
            for (var i = 0; i < type.length; i++)
            {
                if (type && type[i].type)
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
                SearchControl.SearchAllv2(searching, req, res, maxPerPage, pageNumber);
            else if (u_want.users == 1 && u_want.foods == 1 && u_want.recipes == 0)
                SearchControl.SearchUFv2(searching, req, res, maxPerPage, pageNumber);
            else if ( u_want.users == 1 && u_want.foods == 0 && u_want.recipes == 1)
                SearchControl.SearchURv2(searching, req, res, maxPerPage, pageNumber);
            else if (u_want.users == 0 && u_want.foods == 1 && u_want.recipes == 1)
                SearchControl.SearchRFv2(searching, req, res, maxPerPage, pageNumber);
            else if (u_want.users == 1 && u_want.foods == 0 && u_want.recipes == 0)
                SearchControl.SearchUsers(searching, req, res, function(users_list) {
                    if (maxPerPage == 0)
                        res.status(200).send({request: "success", users: users_list});
                    else
                        res.status(200).send({request: "success", users: SearchControl.getUserListV2(users_list, maxPerPage, pageNumber)});
                });
            else if (u_want.users == 0 && u_want.foods == 1 && u_want.recipes == 0)
                SearchControl.SearchFoods(searching, req, res, function(foods_list) {
                    if (maxPerPage == 0)
                        res.status(200).send({request: "success", foods: foods_list});
                    else
                        res.status(200).send({request: "success", foods: SearchControl.getFoodListV2(foods_list, maxPerPage, pageNumber)});
                });
            else if (u_want.users == 0 && u_want.foods == 0 && u_want.recipes == 1)
                SearchControl.SearchRecipes(searching, req, res, function(recipes_list) {
                    if (maxPerPage == 0)
                        res.status(200).send({request: "success", users: recipes_list});
                    else
                        res.status(200).send({request: "success", recipes: SearchControl.getRecipeListV2(recipes_list, maxPerPage, pageNumber)});
                });
            else
                res.status(500).send({request:"error"});
        });
    });
});

// ===============================================================================================================================================
module.exports = router;