/**
 * Created by Julian on 02/11/2014.
 */
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var formidable = require('formidable');
var BSON = mongo.BSONPure;
var CodeError = require('../public/javascripts/error_code.js');
var Auth = require('../public/javascripts/auth_control.js');
var RecipeControl =  require('../public/javascripts/recipe_control.js');
// ====================================================================================================================================

// ====================================================================================================================================
var CheckBson = /^[0-9a-fA-F]{24}$/;

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
            // @TODO Manage picture
            var picture = formInfos.picture;
            var mt = formInfos.make_time;
            var ct = formInfos.cooking_time;
            var instruction = formInfos.instruction;
            var foods = formInfos.foods;
            if (/^[\],:{}\s]*$/.test(foods.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')))
                foods = JSON.parse(formInfos.foods);
            else
                return (res.status(400).send({request: "error", code: CodeError.CodeRecipeFieldInvalid, message: "The field 'foods' is invalid. Not the format of a JSON"}));

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
            RecipeControl.CheckIngredientsList(foods, req, res, function()
            {
                var db = req.db;
                var new_recipe = { name: name, description: description, picture: picture, make_time: mt, cooking_time : ct, instruction: instruction, foods: foods};
                db.collection("recipes").insert(new_recipe, function(err_insert, insert_res)
                {
                    if (err_insert)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    else if (insert_res == null)
                        res.status(CodeError.StatusDB).send({request:"error", code: CodeError.CodeDB, info: "DB Error"});
                    else
                        res.status(201).send({request: "success", recipe: insert_res[0]});
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

    });
});

/*
 * Edit a Recipe
 * Code:
 *      0 : All Clear
 */
router.delete('/:t/:id', function (req, res) {
    Auth.CheckAuth(req, res, function() {

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