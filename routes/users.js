var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
const cors = require('./cors');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.cors , function(req, res, next) {
  User.find({})
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type' , 'application/json');
    res.json(user);
  })
  .catch((err) => {
    res.statusCode = 500;
    res.setHeader('Content-Type' , 'application/json');
    res.json({err:err});
  });
});

router.post('/signup', cors.cors ,(req,res,next) => {
  User.register(new User ({username: req.body.username}), 
  req.body.password, (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type' , 'application/json');
      res.json({err:err});
    }
    else{
      passport.authenticate('local')(req,res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json({success : true, status: 'Registration Successful'});
      });
    }
  });
});

router.post('/login', cors.cors , passport.authenticate('local'),  (req,res) => {
  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type' , 'application/json');
  res.json({success : true, token: token, status: 'Login Successful'});
});

module.exports = router;
