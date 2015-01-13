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
var db = mongoskin.db("mongodb://localhost:27017/Nourriture", {native_parser:true});

// Route directory files
var routes = require('./routes/index');
var users = require('./routes/users');
var recipes = require('./routes/recipes');
var foods = require('./routes/foods');
var login = require('./routes/login');
var search = require('./routes/search');

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
app.use(express.static(path.join(__dirname, 'public')));
app.use("/public", express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});


// Route
app.use('/', routes);
app.use('/users', users);
app.use('/recipes', recipes);
app.use('/login', login);
app.use('/foods', foods);
app.use('/search', search);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
            .send({"request": "error", "code": "100", "message": {}});
    });
}

module.exports = app;
