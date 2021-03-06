var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require("./config");

// Configuration
var currentConfig = config.getCurrent() || config.load();

// Database
var mongoskin = require('mongoskin');
var db = mongoskin.db("mongodb://localhost:" + currentConfig.dbPort + "/Nourriture", { native_parser: true });

// Route directory files
var routes = require('./routes/index');
var users = require('./routes/users');
var recipes = require('./routes/recipes');
var foods = require('./routes/foods');
var search = require('./routes/search');
var fsApi = require('./routes/fatSecretApi');

var app = express();

// Express environment and configuration
app.set('env', currentConfig.mode);
//app.use(favicon(__dirname + '/public/favicon.ico'));

if (currentConfig == config.development)
    app.use(logger('dev'));
else
    app.use(logger());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

(app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}));

// Route
app.use('/', routes);
app.use('/users', users);
app.use('/recipes', recipes);
app.use('/foods', foods);
app.use('/search', search);
app.use('/fsApi', fsApi);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404).json({"request": "error", "code": "100", "message": "Not found."});
});

// error handlers
if (currentConfig == config.development) {
    // print stack trace
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
            .send({"request": "error", "code": "100", "message": err.message});
    });
}
else{
    // print stack trace
    app.use(function(err, req, res, next) {
        res.status(err.status || 500)
            .send({"request": "error", "code": "100", "message": "An unknown error occurred."});
    });
}

module.exports = app;
