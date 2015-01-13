/**
 * Created by Julian on 13/01/2015.
 */

var CodeError = require('./error_code.js');

// ===============================================================================================================================================

// ===============================================================================================================================================
function SearchUsers(msg, req, res, next)
{
    var db = req.db;
    db.collection("user", function(err_collection, user_collection)
    {
       if (err_collection ||  user_collection == null)
           return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
       else
       {
           var user_find = {};
           if (msg != undefined && msg != "")
                user_find = {$or: [{pseudo : new RegExp(msg)}, {firstname: new RegExp(msg)}, {lastname: new RegExp(msg)}]};
           user_collection.find(user_find, function(err_find, found_list)
           {
              if (err_find || found_list == null)
                  return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
              found_list.toArray(function(err, items)
              {
                  for (var i = 0; i < items.length; i++)
                  {
                      delete items[i].password;
                      delete items[i].auth_token;
                  }
                  next(items);
              });
           });
       }
    });
}

function SearchRecipes(msg, req, res, next)
{
    var db = req.db;
    db.collection("recipes", function(err_collection, recipes_collection)
    {
        if (err_collection ||  recipes_collection == null)
            return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
        else
        {
            recipes_collection.find({name : new RegExp(msg)}, function(err_find, found_list)
            {
                if (err_find || found_list == null)
                    return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
                found_list.toArray(function(err, items)
                {
                    next(items);
                });
            });
        }
    });
}

function SearchFoods(msg, req, res, next)
{
    var db = req.db;
    db.collection("food", function(err_collection,foods_collection)
    {
        if (err_collection ||  foods_collection == null)
            return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
        else
        {
            foods_collection.find({name : new RegExp(msg)}, function(err_find, found_list)
            {
                if (err_find || found_list == null)
                    return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
                found_list.toArray(function(err, items)
                {
                    next(items);
                });
            });
        }
    });
}
// ===============================================================================================================================================
function SearchAll(msg, req, res)
{
    SearchUsers(msg, req, res, function(users_found) {
        SearchRecipes(msg, req, res, function(recipes_found) {
            SearchFoods(msg, req, res, function(foods_found) {
                res.status(200).send({request: "success", users: users_found, recipes: recipes_found, foods: foods_found})
            });
        });
    });
}

function SearchUR(msg, req, res)
{
    SearchUsers(msg, req, res, function(users_found) {
        SearchRecipes(msg, req, res, function (recipes_found) {
            res.status(200).send({request: "success", users: users_found, recipes: recipes_found})
        });
    });
}

function SearchUF(msg, req, res)
{
    SearchUsers(msg, req, res, function(users_found) {
        SearchFoods(msg, req, res, function(foods_found) {
            res.status(200).send({request: "success", users: users_found, foods: foods_found})
        });
    });
}

function SearchRF(msg, req, res)
{
    SearchRecipes(msg, req, res, function(recipes_found) {
        SearchFoods(msg, req, res, function(foods_found) {
            res.status(200).send({request: "success", recipes: recipes_found, foods: foods_found})
        });
    });
}
// ===============================================================================================================================================
exports.SearchUsers = SearchUsers;
exports.SearchRecipes = SearchRecipes;
exports.SearchFoods = SearchFoods;
exports.SearchAll = SearchAll;
exports.SearchUR = SearchUR;
exports.SearchUR = SearchUR;
exports.SearchUF = SearchUF;
exports.SearchRF = SearchRF;