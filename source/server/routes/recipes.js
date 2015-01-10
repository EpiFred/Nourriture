/**
 * Created by Julian on 02/11/2014.
 */
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var formidable = require('formidable');
var BSON = mongo.BSONPure;
var fs = require('fs');
var CodeError = require('../public/javascripts/error_code.js');
var Auth = require('../public/javascripts/auth_control.js');
var RecipeControl =  require('../public/javascripts/recipe_control.js');
// ====================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

// ====================================================================================================================================

/*
 * Get a Recipe
 * Code:
 *      0 : All Clear
 */
router.get('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var token = req.params.t;
        var idRecip = req.params.id;

        if (!(CheckBson.test(idRecip)))
            res.status(404).send({request: "error", code: CodeError.CodeRecipeGetNotFound, info: "Recipe could not be found."});
        var db = req.db;
        db.collection('recipes').findById(idRecip, function (err_collection, recipes_res) {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else if (recipes_res == null)
                res.status(404).send({request: "error", code: CodeError.CodeRecipeGetNotFound, info: "Recipe could not be found."});
            else
                res.status(201).send({request: "success", recipe: recipes_res});
        });
    });
});

/*
 * Create a Recipe
 * Code:
 *      0 : All Clear
 */
router.post('/:t', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();

        form.parse(req, function (error, formInfos, files) {
            var checkError;
            var name = formInfos.name;
            var description = formInfos.description;
            var picture = files.picture;
            var mt = formInfos.make_time;
            var ct = formInfos.cooking_time;
            var instruction = formInfos.instruction;
            var foods = formInfos.foods;
            if (foods != undefined)
                if (/^[\],:{}\s]*$/.test(foods.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                    foods = JSON.parse(formInfos.foods);
                else
                    return (res.status(400).send({request: "error", code: CodeError.CodeRecipeFieldInvalid, message: "The field 'foods' is invalid. Not the format of a JSON"}));
            else
                return ({request: "error", code: CodeError.CodeRecipeFieldMissing, message: "The field 'foods' is mandatory and has not been specified."});


            if ((checkError = RecipeControl.CheckFieldCreate(name, "name")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(description, "description")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(mt, "make_time")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(ct, "cooking_time")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(instruction, "instruction")).code != 0)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckPicture(picture)).code != 0)
                return (res.status(400).send(checkError));

            RecipeControl.CheckIngredientsList(foods, req, res, function()
            {
                var db = req.db;
                var new_recipe = { name: name, description: description, make_time: mt, cooking_time : ct, instruction: instruction, foods: foods};
                db.collection("recipes", function(err_collection, recipes_collection)
                {
                    if (err_collection)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    else if (recipes_collection == null)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    else
                    {
                        recipes_collection.insert(new_recipe, function(err_insert, insert_res)
                        {
                            if (err_insert)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else if (insert_res == null)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else
                            {
                                var new_picture_url = RecipeControl.GetNewPictureName(picture.name, insert_res[0]._id).url;
                                fs.rename(picture.path, new_picture_url, function (err_rename)
                                {
                                    if (err_rename)
                                        res.status(CodeError.StatusPermissionFile).send({request: "error", code: CodeError.CodePermissionFile, message: "Can't save the file"});
                                    else
                                    {
                                        recipes_collection.update({_id : insert_res[0]._id} , {$set : {picture : new_picture_url}}, function (err_update, update_done)
                                        {
                                            if (err_update)
                                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                            else if (update_done != 1)
                                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                                            else
                                            {
                                                insert_res[0].picture = new_picture_url;
                                                res.status(201).send({request: "success", recipe: insert_res[0]});
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    });
});

/*
 * Edit a Recipe
 * Code:
 *      0 : All Clear
 */
router.put('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var form = new formidable.IncomingForm();
        form.parse(req, function (error, formInfos, files) {
            if (Object.keys(formInfos).length == 0 && Object.keys(files).length == 0)
                return (res.status(400).send({request: "error", code: CodeError.CodeRecipeEditNothing, message: "Nothing to update."}));
            var checkError;
            var name = formInfos.name;
            var description = formInfos.description;
            var picture = files.picture;
            var mt = formInfos.make_time;
            var ct = formInfos.cooking_time;
            var instruction = formInfos.instruction;
            var foods = formInfos.foods;
            if (foods != undefined)
                if (/^[\],:{}\s]*$/.test(foods.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                    foods = JSON.parse(formInfos.foods);
                else
                    return (res.status(400).send({request: "error", code: CodeError.CodeRecipeFieldInvalid, message: "The field 'foods' is invalid. Not the format of a JSON"}));

            if ((checkError = RecipeControl.CheckFieldCreate(name, "name")).code == CodeError.CodeRecipeFieldInvalid)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(description, "description")).code == CodeError.CodeRecipeFieldInvalid)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(mt, "make_time")).code == CodeError.CodeRecipeFieldInvalid)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(ct, "cooking_time")).code == CodeError.CodeRecipeFieldInvalid)
                return (res.status(400).send(checkError));
            if ((checkError = RecipeControl.CheckFieldCreate(instruction, "instruction")).code == CodeError.CodeRecipeFieldInvalid)
                return (res.status(400).send(checkError));
            checkError = RecipeControl.CheckPicture(picture);
            if (!(checkError.code == 0 || checkError.code == undefined))
                return (res.status(400).send(checkError));
            // @TODO change edit systeme of recipes
            RecipeControl.CheckIngredientsList(foods, req, res, function()
            {
                var db = req.db;
                var idRecipe = req.params.id;
                if (!CheckBson.test(idRecipe))
                    return (res.status(404).send({request: "error", code: CodeError.CodeRecipeEditNotFound, message: "Recipe could not be found."}));
                db.collection("recipes", function(err_collection, recipes_collection){
                   if (err_collection)
                       return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
                   recipes_collection.findOne({_id: BSON.ObjectID(idRecipe)}, function(err_find, recipe_found){
                      if (err_find)
                          return (res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"}));
                      else if (recipe_found == null)
                          return (res.status(404).send({request: "error", code: CodeError.CodeRecipeEditNotFound, message: "Recipe could not be found."}));
                      else
                      {
                          var update_recipe = {};
                          if (name != undefined)
                              update_recipe.name = name;
                          if (description != undefined)
                              update_recipe.description = description;
                          if (mt != undefined)
                              update_recipe.make_time = mt;
                          if (ct != undefined)
                              update_recipe.cooking_time = ct;
                          if (instruction != undefined)
                              update_recipe.instruction = instruction;
                          if (foods != undefined)
                              update_recipe.foods = foods;
                          if (picture != undefined)
                          {
                              var new_picture_url = RecipeControl.GetNewPictureName(picture.name, recipe_found._id).url;
                              if (typeof recipe_found.picture == "string")
                                  fs.unlink(recipe_found.picture);
                              fs.rename(picture.path, new_picture_url, function (err_rename)
                              {
                                  if (err_rename)
                                      return (res.status(CodeError.StatusPermissionFile).send({request: "error", code: CodeError.CodePermissionFile, message: "Can't save the file"}));
                              });
                              update_recipe.picture = new_picture_url;
                          }
                          recipes_collection.update({ _id : recipe_found._id }, { $set : update_recipe }, function(err_update, recipe_updated) {
                              if (err_update)
                                  res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                              else if (recipe_updated != 1)
                                  res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                              else
                              {
                                  var new_recipe_updated = {};
                                  for (var _old in recipe_found)
                                      new_recipe_updated[_old] = recipe_found[_old];
                                  for (var _new in update_recipe)
                                      new_recipe_updated[_new] = update_recipe[_new];
                                  res.status(201).send({request: "success", user: new_recipe_updated});
                              }
                          });
                      }
                   });
                });
            });
        });
    });
});

/*
 * Delete a Recipe
 * Code:
 *      0 : All Clear
 */
// @TODO Manage delete picture
router.delete('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {
        var db = req.db;
        db.collection('recipes', function(err_collection, recipes_collection) {
            if (err_collection)
                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
            else
            {
                var idRecipe = req.params.id;
                recipes_collection.findOne({ _id : BSON.ObjectID(idRecipe)}, function (err_find, recipe_found) {
                    if (err_find)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    if (recipe_found === null)
                        res.status(404).send({ request: "error", code: CodeError.CodeRecipeRemoveNotFound, info: "Recipe could not be found." });
                    else
                    {
                        recipes_collection.remove({ _id : recipe_found._id}, function(err_del, res_del){
                            if (err_del)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else if (res_del != 1)
                                res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                            else
                            {
                                if (typeof recipe_found.picture == "string")
                                    fs.unlink(recipe_found.picture);
                                res.status(201).send("deleted");
                            }
                        });
                    }
                });
            }
        });
    });
});
// ================================================================================== OLD =======================================================================================
///* GET recipes listing. */
//router.get('/', function(req, res) {
//    res.render('recipes', { title: 'Nourriture - Recipe' });
//});
//
///*
// * GET recipeslist.
// */
router.get('/list', function(req, res) {
    var db = req.db;
    db.collection('recipes').find().toArray(function (err, items) {
        res.json(items);
    });
});
//
///*
// * GET Simple Recipe
// */
//router.get('/recipeid/:id', function(req, res) {
//    var db = req.db;
//    var recipeId = req.params.id;
//    db.collection('recipes').findById(recipeId, function(err, result) {
//        res.json(result);
//    });
//});
//
///*
// * POST to addrecipes
// */
//router.post('/addrecipes', function(req, res) {
//    var db = req.db;
//    db.collection('recipes').insert(req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
///*
// * DELETE to deleteingredients.
// */
//router.delete('/deleterecipes/:id', function(req, res) {
//    var db = req.db;
//    var recipesToDelete = req.params.id;
//    db.collection('recipes').removeById(recipesToDelete, function(err, result) {
//        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
//    });
//});
//
///*
// *  EDIT an Recipes
// */
//router.put('/editrecipes/:id', function(req, res){
//    var db = req.db;
//    var recipeToEdit = req.params.id;
//    db.collection('recipes').updateById(recipeToEdit, req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
///*
// *  Rate an Recipes
// */
//router.put('/raterecipes/:id', function(req, res){
//    var db = req.db;
//    var recipeToRate = BSON.ObjectID(req.params.id);
//    db.collection('recipes').update({ _id: recipeToRate}, {$set: {'Mark' : req.body.rate }}, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
///*
// *  ADD Recipes in user favorties
// */
//router.put('/recipesAddFavorites/:id', function(req, res) {
//    var db = req.db;
//    var userId = BSON.ObjectID(req.params.id);
//    db.collection('account').update({ _id: userId}, {$push: {'Favorites' : req.body.recipeId }}, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
///*
// * COMMENT a recipe
// */
//router.put('/recipesComment/:id', function(req, res) {
//    var db = req.db;
//    var recipeId = BSON.ObjectID(req.params.id);
//    // TO DO
//});
//
///*
// *  GET all Ingredients of a Recipe
// */
//router.get('/ingredientslist/:id', function(req, res){
//    var db = req.db;
//    var recipeId = req.params.id;
//    db.collection('recipes').findById(recipeId, function(err, resIngredients) {
//        db.collection('ingredients').find({ _id: { $in: resIngredients.Ingredients}}).toArray(function(err, result){
//            res.json(result);
//        });
//    });
//});
//
///*
// *  ADD Ingredient to a recipe
// */
//router.put('/recipesAddIngredients/:id', function(req, res) {
//    var db = req.db;
//    var recipeId = new BSON.ObjectID(req.params.id);
//    var ingredientId = new BSON.ObjectID(req.body.ingredientId);
//    db.collection('recipes').update({ _id: recipeId}, {$push: {'Ingredients' : ingredientId }}, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
// ================================================================================================================================================================================
module.exports = router;