var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    res.render('users', { title: 'Nourriture - Users' });
});


/*
 * GET userlist.
 */
router.get('/accountlist', function(req, res) {
    var db = req.db;
    db.collection('account').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * GET Simple User
 */
router.get('/accountid/:id', function(req, res) {
    var db = req.db;
    var userId = req.params.id;
    db.collection('account').findById(userId, function(err, result) {
        res.json(result);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    db.collection('account').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deleteuser.
 */
router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;
    var userToDelete = req.params.id;
    db.collection('account').removeById(userToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});

/*
 *  EDIT a User
 */
router.put('/editaccount/:id', function(req, res){
    var db = req.db;
    var userToEdit = req.params.id;
    db.collection('account').updateById(userToEdit, req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

// ============================================================================================================================================================

/*
 * END POINT
 */
router.get('/get_info/:id', function(req,res){
    var db = req.db;
    db.collection('account').find().toArray(function (err, items) {
        res.json(items);
    });
});

router.post('/create', function(req,res){
    res.send('route create post');
});

router.put('/set_info', function(req,res){
    res.send('route set_info put');
});

router.delete('/delete', function(req,res){
    res.send('route delete delete');
});

module.exports = router;
