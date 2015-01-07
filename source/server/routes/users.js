var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var UserControl = require('../public/javascripts/users_control.js');

// ====================================================================================================================================
var CodeDB = 1;
var CodeLogin = 203;
// ====================================================================================================================================

/*
 *  Route for login
 *  Code:
 *      0 : Authentication OK
 *      201 : Field missing
 *      202 : Field invalid
 *      10X3 : Field not conform to the protocol
 *      CodeLogin : Bad Authentication
 *      CodeDB : DB Error
 *  TO DO Manage Token --> Handle other page the Token
 */
router.get('/:id', function(req, res)
{

});

/*
 *  Route for login
 *  Code:
 *      0 : Authentication OK
 *      201 : Field missing
 *      202 : Field invalid
 *      10X3 : Field not conform to the protocol
 *      CodeLogin : Bad Authentication
 *      CodeDB : DB Error
 *  TO DO Manage Token --> Handle other page the Token
 */
router.post('/', function(req, res)
{
});

/*
 *  Route for login
 *  Code:
 *      0 : Authentication OK
 *      201 : Field missing
 *      202 : Field invalid
 *      10X3 : Field not conform to the protocol
 *      CodeLogin : Bad Authentication
 *      CodeDB : DB Error
 *  TO DO Manage Token --> Handle other page the Token
 */
router.put('/', function(req, res)
{
});
// =========================================================================== OLD =============================================================================
///* GET users listing. */
//router.get('/', function(req, res) {
//    res.render('users', { title: 'Nourriture - Users' });
//});
//
///*
// * GET userlist.
// */
//router.get('/accountlist', function(req, res) {
//    var db = req.db;
//    db.collection('account').find().toArray(function (err, items) {
//        res.json(items);
//    });
//});
//
///*
// * GET Simple User
// */
//router.get('/accountid/:id', function(req, res) {
//    var db = req.db;
//    var userId = req.params.id;
//    db.collection('account').findById(userId, function(err, result) {
//        res.json(result);
//    });
//});
//
///*
// * POST to adduser.
// */
//router.post('/adduser', function(req, res) {
//    var db = req.db;
//    db.collection('account').insert(req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});
//
///*
// * DELETE to deleteuser.
// */
//router.delete('/deleteuser/:id', function(req, res) {
//    var db = req.db;
//    var userToDelete = req.params.id;
//    db.collection('account').removeById(userToDelete, function(err, result) {
//        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
//    });
//});
//
///*
// *  EDIT a User
// */
//router.put('/editaccount/:id', function(req, res){
//    var db = req.db;
//    var userToEdit = req.params.id;
//    db.collection('account').updateById(userToEdit, req.body, function(err, result){
//        res.send(
//            (err === null) ? { msg: '' } : { msg: err }
//        );
//    });
//});

// ============================================================================================================================================================
module.exports = router;
