var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
require('./models/Genres');
require('./models/Books');
var routes = require('./routes/index');
var users = require('./routes/users');
var mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://localhost/bookstore');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({fault: err.message});
    console.log(err);
    // res.render('error', {
//       message: err.message,
//       error: err
//     });
// 	res.json(err.Error);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log('error is ');console.log(err);
  // res.render('error', {
//     message: err.message,
//     error: {}
//   });
	res.json(err.message);
});


module.exports = app;


