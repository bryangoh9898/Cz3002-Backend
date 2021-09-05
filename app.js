var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var authenticate = require('./authenticate');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoose = require('mongoose');

var url = 'mongodb+srv://bryangoh:2DerN-A.*$n56!y@cluster0.l3ofw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

const httpServer = require("http").createServer(app);
const options = { cors: {
    origin: ["http://localhost:3000","https://admin.socket.io/#/","https://localhost:3443"],
} };
const io = require("socket.io")(httpServer, options);
const port = process.env.PORT || 4001;
const { instrument } = require("@socket.io/admin-ui");

httpServer.listen(port,()=>{
  console.log(`listening on port ${port}`)
});

const initQuizListeners = require("./quizGame/quizListeners");
initQuizListeners(io);

instrument(io, {
  readonly: true,
  auth: false
});

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
