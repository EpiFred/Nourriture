var express = require("express");
var app = module.exports = express.createServer();

app.set('views', __dirname + '/app/view');
app.get("/hello.txt", function(req, res){
    res.send('Hello World');
});

var server = app.listen(3000, function(req, res){
    console.log('Listening on port %d', server.address().port);
});