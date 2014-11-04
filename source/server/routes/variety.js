/**
 * Created by Julian on 03/11/2014.
 */
var express = require('express');
var router = express.Router();

/* GET variety listing. */
router.get('/', function(req, res) {
    res.render('variety', { title: 'Nourriture - Variety' });
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