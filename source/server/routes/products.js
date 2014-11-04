/**
 * Created by Julian on 31/10/2014.
 */

var express = require('express');
var router = express.Router();

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
 * DELETE to deleteproducts.
 */
router.delete('/deleteproducts/:id', function(req, res) {
    var db = req.db;
    var productsToDelete = req.params.id;
    db.collection('products').removeById(productsToDelete, function(err, result) {
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

router.get('get_recipes', function(req, res){
    res.send('route get_ingredients get');
});

module.exports = router;