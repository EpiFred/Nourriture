/**
 * Created by Julian on 31/10/2014.
 */

var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

/* GET products listing. */
router.get('/', function(req, res) {
    res.render('products', { title: 'Nourriture - Products' });
});

/*
 * GET productslist.
 */
router.get('/productslist', function(req, res) {
    var db = req.db;
    db.collection('products').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * GET Simple Recipe
 */
router.get('/productid/:id', function(req, res) {
    var db = req.db;
    var productId = req.params.id;
    db.collection('products').findById(productId, function(err, result) {
        res.json(result);
    });
});

/*
 * POST to addproducts
 */
router.post('/addproducts', function(req, res) {
    var db = req.db;
    db.collection('products').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteproducts.
 */
router.delete('/deleteproducts/:id', function(req, res) {
    var db = req.db;
    var productsToDelete = req.params.id;
    db.collection('products').removeById(productsToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 *  EDIT a Product
 */
router.put('/editproducts/:id', function(req, res){
    var db = req.db;
    var productToEdit = req.params.id;
    db.collection('products').updateById(productToEdit, req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 *  GET all recipes of a product
 */
router.get('/recipeslist/:id', function(req, res){
    var db = req.db;
    var productId = req.params.id;
    db.collection('products').findById(productId, function(err, resRecipes) {
        db.collection('recipes').find({ _id: { $in: resRecipes.Recipes}}).toArray(function(err, result){
            res.json(result);
        });
    });
});

/*
 *  ADD Recipe to a Product
 */
router.put('/productAddRecipe/:id', function(req, res) {
    var db = req.db;
    var productId = new BSON.ObjectID(req.params.id);
    var recipeId = new BSON.ObjectID(req.body.recipeId);
    db.collection('products').update({ _id: productId}, {$push: {'Recipes' : recipeId }}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});
// ================================================================================================================================================================================
module.exports = router;