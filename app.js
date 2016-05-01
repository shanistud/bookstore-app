var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./models/Genres');
require('./models/Books');
require('./models/Users');
require('./config/passport');
var routes = require('./routes/index');
var mongoose = require('mongoose');
var passport = require('passport');
var app = express();

mongoose.connect('mongodb://localhost/bookstore');

//should be retrieved via env var and config file ignored from git

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware stack configuration
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use(express.static('./public'));
app.use(passport.initialize());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') 
{
  app.use(function(err, req, res, next) 
  {
  	console.log(err);
  	
  	if (err.code === 11000)
  	{
  		err.message = 'duplicate key error';
  	}
  	
    res.status(err.status || 500).send({fault: err.message});
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) 
{
	if (err.code === 11000)
  	{
  		err.message = 'duplicate key error';
  	}
  	
  	res.sendStatus(err.status || 500);
});


module.exports = app;


