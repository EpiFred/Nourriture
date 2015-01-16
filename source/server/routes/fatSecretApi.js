/**
 * Created by Julian on 14/01/2015.
 */


var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var rest = require('restler');
var crypto = require('crypto');

// ================================================================================================================================================================================
var consumer_public_key = "d25cc9a48da040b7bb4d5bd9ed59ef13";
var comsumer_secret_key = "b41d9b7ec41f431085912807c6007d73";
//var comsumer_secret_key = "63c0c462-aa80-44c0-8a4e-44483c481b2a";
var fatSecretRestUrl = 'http://platform.fatsecret.com/rest/server.api';
var date = new Date;

var recipeReady = [];
// ================================================================================================================================================================================
function GetRecipesList(format, max_result, searching, next)
{
    var secret_key = comsumer_secret_key;
    var reqObj = {
        format: format,
        max_results: max_result,
        method: "recipes.search",
        oauth_consumer_key: consumer_public_key,
        oauth_nonce: Math.random().toString(36).replace(/[^a-z]/, '').substr(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(date.getTime()),
        oauth_version: "1.0",
        search_expression: ''+ searching
    };

    var paramsStr = '';
    for (var i in reqObj)
        paramsStr += "&" + i + "=" + reqObj[i];
    paramsStr = paramsStr.substr(1);

    var sigBaseStr = "POST&" + encodeURIComponent(fatSecretRestUrl)  + "&" + encodeURIComponent(paramsStr);
    //console.log("sig base str = " + sigBaseStr);

    secret_key += "&";
    var hashedBaseStr  = crypto.createHmac('sha1', secret_key).update(sigBaseStr).digest('base64');
    //console.log("oauth_sig = " + hashedBaseStr);

    reqObj.oauth_signature = hashedBaseStr;

    rest.post(fatSecretRestUrl, { data: reqObj }).on('complete', function(data, response)
    {
        next(data);
    });
}

function GetFoodsList(format, max_result, searching, next)
{
    var secret_key = comsumer_secret_key;
    var reqObj = {
        format: format,
        max_results: max_result,
        method: "foods.search",
        oauth_consumer_key: consumer_public_key,
        oauth_nonce: Math.random().toString(36).replace(/[^a-z]/, '').substr(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(date.getTime()),
        oauth_version: "1.0",
        search_expression: ''+ searching
    };

    var paramsStr = '';
    for (var i in reqObj)
        paramsStr += "&" + i + "=" + reqObj[i];
    paramsStr = paramsStr.substr(1);

    var sigBaseStr = "POST&" + encodeURIComponent(fatSecretRestUrl)  + "&" + encodeURIComponent(paramsStr);
    //console.log("sig base str = " + sigBaseStr);

    secret_key += "&";
    var hashedBaseStr  = crypto.createHmac('sha1', secret_key).update(sigBaseStr).digest('base64');
    //console.log("oauth_sig = " + hashedBaseStr);

    reqObj.oauth_signature = hashedBaseStr;

    rest.post(fatSecretRestUrl, { data: reqObj }).on('complete', function(data, response)
    {
        next(data);
    });
}

function GetRecipesID(format, id, next)
{
    var secret_key = comsumer_secret_key;
    var reqObj = {
        format: format,
        method: "recipe.get",
        oauth_consumer_key: consumer_public_key,
        oauth_nonce: Math.random().toString(36).replace(/[^a-z]/, '').substr(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(date.getTime()),
        oauth_version: "1.0",
        recipe_id: id
    };

    var paramsStr = '';
    for (var i in reqObj)
        paramsStr += "&" + i + "=" + reqObj[i];
    paramsStr = paramsStr.substr(1);

    var sigBaseStr = "POST&" + encodeURIComponent(fatSecretRestUrl)  + "&" + encodeURIComponent(paramsStr);
    //console.log("sig base str = " + sigBaseStr);

    secret_key += "&";
    var hashedBaseStr  = crypto.createHmac('sha1', secret_key).update(sigBaseStr).digest('base64');
    //console.log("oauth_sig = " + hashedBaseStr);

    reqObj.oauth_signature = hashedBaseStr;

    rest.post(fatSecretRestUrl, { data: reqObj }).on('complete', function(data, response)
    {
        next(data);
    });
}

function GetFoodID(format, id, next)
{
    var secret_key = comsumer_secret_key;
    var reqObj = {
        food_id: id,
        format: format,
        method: "food.get",
        oauth_consumer_key: consumer_public_key,
        oauth_nonce: Math.random().toString(36).replace(/[^a-z]/, '').substr(2),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(date.getTime()),
        oauth_version: "1.0"
    };

    var paramsStr = '';
    for (var i in reqObj)
        paramsStr += "&" + i + "=" + reqObj[i];
    paramsStr = paramsStr.substr(1);

    var sigBaseStr = "POST&" + encodeURIComponent(fatSecretRestUrl)  + "&" + encodeURIComponent(paramsStr);
    //console.log("sig base str = " + sigBaseStr);

    secret_key += "&";
    var hashedBaseStr  = crypto.createHmac('sha1', secret_key).update(sigBaseStr).digest('base64');
    //console.log("oauth_sig = " + hashedBaseStr);

    reqObj.oauth_signature = hashedBaseStr;


    rest.post(fatSecretRestUrl, { data: reqObj }).on('complete', function(data, response)
    {
        next(data);
    });
}

function RecipeReadyToAdd(req, res)
{
    if (recipeReady.length == 0)
        return (res.send("Nothing to add ! "));

    // Clear doublon
    var arr = {};
    for ( var i=0; i < recipeReady.length; i++ )
        arr[recipeReady[i]['name']] = recipeReady[i];
    recipeReady = [];
    for ( var key in arr )
        recipeReady.push(arr[key]);

    var db = req.db;
    for (var j = 0; j < recipeReady.length; j++)
    {
        db.collection("recipes", function(err_collection, recipes_collection)
        {
           if (!err_collection && recipes_collection != null)
           {
               (function(j)
               {
                   recipes_collection.findOne({name: recipeReady[j].name}, function (err_find, founded)
                   {
                       if (!err_find && founded == null)
                       {
                           var list_to_find = [];
                           var list_desc_ingr = [];
                           for (var k = 0; k < recipeReady[j].foods.length; k++) {
                               var tmpFood = recipeReady[j].foods[k];
                               list_to_find[k] = {name: tmpFood.name};
                               list_desc_ingr[(tmpFood.name)] =  tmpFood.detail;
                           }
                           (function (j)
                           {
                               db.collection("food").find({$or: list_to_find}, function(err_find, listFound)
                               {
                                   if (!err_find && listFound != null)
                                   {
                                       listFound.toArray(function(err,items)
                                       {
                                           var ingredient_list = [];
                                           for (var i = 0; i < items.length; i++)
                                               ingredient_list[i] = { id: items[i]._id, name: items[i].name, detail:  list_desc_ingr[items[i].name]};
                                           recipeReady[j].foods = ingredient_list;
                                           recipes_collection.insert(recipeReady[j], function(a,b){});
                                       });
                                   }
                               });
                           }(j));
                       } else if (founded != null)
                            recipeReady.splice(j, 1);
                   });
               }(j));
           }
        });
    }
    res.send("Adding recipes...");
}

function AddOneRecipe(recipe, req, res)
{
    var db = req.db;
    db.collection("recipes", function (err_collection, recipes_collection)
    {
        if (!err_collection && recipes_collection != null)
        {
            recipes_collection.findOne({name: recipe.recipe_name}, function(err_find, founded)
            {
                if (!err_find && founded == null)
                {
                    GetRecipesID("json", recipe.recipe_id, function(fsRes) {
                        if (fsRes == undefined && fsRes.recipe == undefined)
                            return ;
                        var fsRecipe = fsRes.recipe;
                        if (fsRecipe == undefined)
                            return;
                        var images = "";
                        if (fsRecipe.recipe_images)
                            images = fsRecipe.recipe_images;
                        else
                            images = "";
                        var new_recipe = {
                            name: fsRecipe.recipe_name,
                            description: fsRecipe.recipe_description,
                            picture: images.recipe_image,
                            make_time: fsRecipe.preparation_time_min,
                            cooking_time: fsRecipe.cooking_time_min
                        };

                        if (fsRecipe.preparation_time_min == undefined)
                            new_recipe.make_time = 0;
                        if (fsRecipe.cooking_time_min == undefined)
                            new_recipe.cooking_time = 0;

                        var direction = fsRecipe.directions.direction;
                        var new_instruction = "";
                        for (var i = 0; i < direction.length; i++)
                            new_instruction += direction[i].direction_number + " - " + direction[i].direction_description + "; ";
                        new_recipe.instruction = new_instruction;

                        var ingredient = fsRecipe.ingredients.ingredient;
                        var list_to_find = [];
                        var list_desc_ingr = [];
                        for (var j = 0; j < ingredient.length; j++)
                        {
                            list_to_find[j] = { name: ingredient[j].food_name };
                            list_desc_ingr[(ingredient[j].food_name)] =  ingredient[j].ingredient_description;
                            FoodExist(ingredient[j], req, res);
                        }

                        var ingredient_list = [];
                        for (var i = 0; i < list_to_find.length; i++)
                            ingredient_list[i] = {  name: list_to_find[i].name, detail: list_desc_ingr[list_to_find[i].name]};
                        new_recipe.foods = ingredient_list;

                        recipeReady[recipeReady.length] = new_recipe;

                        res.send("'" + new_recipe.name + "' is ready to be add, plz use /fsApi/addRecipeReady");
                    });
                }
                else
                    res.send("'" + recipe.recipe_name + "' already in the db");
            });
        }
    });
}

function FoodExist(food, req, res)
{
    var db = req.db;
    db.collection("food", function (err_collection, food_collection)
    {
       if (!err_collection && food_collection != null)
       {
           food_collection.findOne({name: food.food_name}, function(err_find, founded){
              if (!err_find && founded == null)
              {
                  GetFoodID("json", food.food_id, function (fsRes){
                      if (!fsRes && (fsRes.food) == undefined)
                        return;
                      var fsFood = fsRes.food;
                      if (fsFood == undefined)
                          return;
                      var new_food = { name: fsFood.food_name };
                      var serving = fsFood.servings.serving;
                      for (var i = 0; i < serving.length; i++)
                          if (serving[i].measurement_description == "g")
                            new_food.nutritional_values = serving[i];
                      if (new_food.nutritional_values)
                      {
                          delete new_food.nutritional_values.serving_id;
                          delete new_food.nutritional_values.serving_url;
                      }
                      food_collection.insert(new_food, function(a,b){});
                  });
              }
           });
       }
    });
}
// ================================================================================================================================================================================
router.get('/', function(req, res) {
    res.send("OK");
});

router.get('/foodID/:id', function(req, res){
   GetFoodID("json", req.params.id, function (food){
       res.send(food);
   });
});

router.get("/recipeID/:id", function (req, res) {
    GetRecipesID("json", req.params.id, function(recipe) {
       res.send(recipe);
    });
});

router.get('/seekFood/:search', function(req, res){
    GetFoodsList("json", 5, req.params.search, function(foodList){
        res.send(foodList);
    });
});

router.get('/seekRecipe/:search', function(req, res){
    GetRecipesList("json", 5, req.params.search, function(recipeList){
        res.send(recipeList);
    });
});

router.get('/OneRecipe/:search', function(req, res){
    GetRecipesList("json", 1, req.params.search, function(recipeslist){
        if (recipeslist != undefined && recipeslist.recipes != undefined && recipeslist.recipes.total_results != 0)
        {
            var newRecipe = recipeslist.recipes.recipe;
            AddOneRecipe(newRecipe, req, res);
        }
        else
            return (res.send("Nothing"));
    });
});

router.get('/addRecipeReady', function (req, res)
{
    RecipeReadyToAdd(req,res);
});

module.exports = router;