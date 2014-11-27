/**
 * Created by Julian on 02/11/2014.
 */
var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

/* GET recipes listing. */
router.get('/', function(req, res) {
    res.render('recipes', { title: 'Nourriture - Recipe' });
});

/*
 * GET recipeslist.
 */
router.get('/recipeslist', function(req, res) {
    var db = req.db;
    db.collection('recipes').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * GET Simple Recipe
 */
router.get('/recipeid/:id', function(req, res) {
    var db = req.db;
    var recipeId = req.params.id;
    db.collection('recipes').findById(recipeId, function(err, result) {
        res.json(result);
    });
});

/*
 * POST to addrecipes
 */
router.post('/addrecipes', function(req, res) {
    var db = req.db;
    db.collection('recipes').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteingredients.
 */
router.delete('/deleterecipes/:id', function(req, res) {
    var db = req.db;
    var recipesToDelete = req.params.id;
    db.collection('recipes').removeById(recipesToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 *  EDIT an Recipes
 */
router.put('/editrecipes/:id', function(req, res){
    var db = req.db;
    var recipeToEdit = req.params.id;
    db.collection('recipes').updateById(recipeToEdit, req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 *  Rate an Recipes
 */
router.put('/raterecipes/:id', function(req, res){
    var db = req.db;
    var recipeToRate = BSON.ObjectID(req.params.id);
    db.collection('recipes').update({ _id: recipeToRate}, {$set: {'Mark' : req.body.rate }}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 *  ADD Recipes in user favorties
 */
router.put('/recipesAddFavorites/:id', function(req, res) {
    var db = req.db;
    var userId = BSON.ObjectID(req.params.id);
    db.collection('account').update({ _id: userId}, {$push: {'Favorites' : req.body.recipeId }}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * COMMENT a recipe
 */
router.put('/recipesComment/:id', function(req, res) {
    var db = req.db;
    var recipeId = BSON.ObjectID(req.params.id);
    // TO DO
});

/*
 *  GET all Ingredients of a Recipe
 */
router.get('/ingredientslist/:id', function(req, res){
    var db = req.db;
    var recipeId = req.params.id;
    db.collection('recipes').findById(recipeId, function(err, resIngredients) {
        db.collection('ingredients').find({ _id: { $in: resIngredients.Ingredients}}).toArray(function(err, result){
            res.json(result);
        });
    });
});

/*
 *  ADD Ingredient to a recipe
 */
router.put('/recipesAddIngredients/:id', function(req, res) {
    var db = req.db;
    var recipeId = new BSON.ObjectID(req.params.id);
    var ingredientId = new BSON.ObjectID(req.body.ingredientId);
    db.collection('recipes').update({ _id: recipeId}, {$push: {'Ingredients' : ingredientId }}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});
// ================================================================================================================================================================================
module.exports = router;