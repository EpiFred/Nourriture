/**
 * Created by PierreYves on 18/01/2015.
 */

var express = require("express");
var app = express();

app.use(express.static(__dirname + '/angular'));

app.get('*', function(req, res) {
    res.sendfile('./angular/index.html');
});

app.listen(8000);