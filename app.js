var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var threadRouter = require('./routes/thread');
var facultyRouter = require('./routes/faculty');
const mongoose = require('mongoose');

var url = 'mongodb+srv://bryangoh:2DerN-A.*$n56!y@cluster0.l3ofw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const connect = mongoose.connect(url,   {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});


connect.then((db) => {
  console.log("Connected correctly to database: ");
}, (err) => { console.log(err); });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/threads', threadRouter);
app.use('/facultyRouter', facultyRouter);
app.use(express.static(path.join(__dirname, 'public')));
 
//other routers that needs authentication place here


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
