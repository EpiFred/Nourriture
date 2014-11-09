/**
 * Created by Julian on 01/11/2014.
 */

var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

/* GET ingredients listing. */
router.get('/', function(req, res) {
    res.render('ingredients', { title: 'Nourriture - Ingredients' });
});

/*
 * GET ingredientslist.
 */
router.get('/ingredientslist', function(req, res) {
    var db = req.db;
    db.collection('ingredients').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * GET Simple Ingredient
 */
router.get('/ingredientid/:id', function(req, res) {
    var db = req.db;
    var ingredientId = req.params.id;
    db.collection('ingredients').findById(ingredientId, function(err, result) {
        res.json(result);
    });
});

/*
 * POST to addingredients.
 */
router.post('/addingredients', function(req, res) {
    var db = req.db;
    db.collection('ingredients').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteingredients.
 */
router.delete('/deleteingredients/:id', function(req, res) {
    var db = req.db;
    var ingredientsToDelete = req.params.id;
    db.collection('ingredients').removeById(ingredientsToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 *  EDIT an Ingredient
 */
router.put('/editingredients/:id', function(req, res){
    var db = req.db;
    var ingredientToEdit = req.params.id;
    db.collection('ingredients').updateById(ingredientToEdit, req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 *  GET all variety of an ingredients
 */
router.get('/varietylist/:id', function(req, res){
    var db = req.db;
    var ingredientId = req.params.id;
    db.collection('ingredients').findById(ingredientId, function(err, resIngredient) {
        db.collection('variety').find({ _id: { $in: resIngredient.Variety}}).toArray(function(err, result){
            res.json(result);
        });
    });
});

/*
 *  Add To Favorties
 */
router.put('/ingredientAddFavorites/:id', function(req, res) {
    var db = req.db;
    var userId = BSON.ObjectID(req.params.id);
    db.collection('account').update({ _id: userId}, {$push: {'Favorites' : req.body.ingredientId }}, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

// ================================================================================================================================================================================

/*
 * END POINT
 */

router.get('/get_by_name', function(req,res){
   res.send('route get_by_name get');
});

router.post('/create', function(req,res){
    res.send('route create post');
});

router.put('/set_by_name', function(req,res){
    res.send('route set_by_name put');
});

router.delete('/delete_by_name', function(req,res){
    res.send('route delete_by_name delete');
});

module.exports = router;