/**
 * Created by Julian on 02/11/2014.
 */
var express = require('express');
var router = express.Router();

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
 * DELETE to deleteingredients.
 */
router.delete('/deleterecipes/:id', function(req, res) {
    var db = req.db;
    var recipesToDelete = req.params.id;
    db.collection('recipes').removeById(recipesToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
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

router.get('get_ingredients', function(req, res){
   res.send('route get_ingredients get');
});

module.exports = router;