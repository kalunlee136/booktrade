var express = require('express');
var app = express();
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');

var port = process.env.port || 8080;
var routes = require('./routes/index');

// view engine setup
app.use(express.static(path.join(__dirname, 'views')));

//connect to mongoDB server
var mongoose = require('mongoose');
require('./models/AllBooks');
require('./models/Users');
require('./models/Trades');
require('./config/passport');

mongoose.connect('mongodb://localhost/news');


// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

routes(app);

app.listen(port)
console.log('Listening to port: '+port);

