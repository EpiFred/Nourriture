var express = require('express');
var router = express.Router();



// ========================================================================== OLD =============================================================================
router.get('/list', function(req, res) {
    var db = req.db;
    db.collection('food').find().toArray(function (err, items) {
        res.json(items);
    });
});
// ============================================================================================================================================================
module.exports = router;