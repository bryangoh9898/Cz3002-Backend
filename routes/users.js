var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
const cors = require('./cors');
var authenticate = require('../authenticate');
const Threads = require('../models/thread');

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

router.route('/signup').options(cors.cors, (req,res) => { res.sendStatus(200);  }).post(cors.cors ,(req,res,next) => {
  User.register(new User ({username: req.body.username, NotificationNumber: 0}), 
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

router.route('/login').options(cors.cors, (req,res) => { res.sendStatus(200);  }).post(cors.cors , passport.authenticate('local'),  (req,res) => {
  const {_id,username} = req.user;
  var token = authenticate.getToken({_id});
  res.statusCode = 200;
  res.setHeader('Content-Type' , 'application/json');
  res.json({success : true, token: token,id:_id,username:username, status: 'Login Successful'});
});


//Retrieves all the thread_id user is involved in
router.route('/getUserInformation')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findById(userId)
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type' , 'application/json');
    res.json(user);
  })
})
.delete(cors.cors, authenticate.verifyUser, (req,res,next) => {
  User.deleteMany({})
  .then(() => {
      res.statusCode = 200;
      res.setHeader('Content-Type' , 'application/json');
      res.json("Successful");
  }, (err) => next(err))
  .catch((err) => next(err))
})

//Includes both the answers and questions
router.route('/getUserContributionCount')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findById(userId)
  .then((user) => {
    var totalContribution = user.ThreadIdsPosted.length + user.ThreadIdsAnswered.length
    res.statusCode = 200;
    res.setHeader('Content-Type' , 'application/json');
    res.json(totalContribution);
  })

})


//Get threads for questions that user has posted
router.route('/getThreadForQuestionsPosted')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findById(userId)
  .then((user) => {
    Threads.find({
      '_id' : {$in: user.ThreadIdsPosted}
    },function(err, docs){
      console.log(docs);
      res.statusCode = 200;
      res.setHeader('Content-Type' , 'application/json');
      res.json(docs);
    })
  })
})

//Get threads for answers that user has posted

// router.route('/getThreadForAnswersPosted')
// .options(cors.cors, (req,res) => {res.sendStatus(200); })
// .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
//   var TokenArray = req.headers.authorization.split(" ");
//   var userId = authenticate.getUserId(TokenArray[1]);
//   User.findById(userId)
//   .then((user) => {
//     Threads.find({
//       '_id' : {$in: user.ThreadIdsAnswered}
//     },function(err, docs){
//       //Docs to return only the answer 
//       console.log(docs);
//       res.statusCode = 200;
//       res.setHeader('Content-Type' , 'application/json');
//       res.json(docs);
//     })
//   })
// })


//get all threads that a user has answered

router.route('/getAnswersPost')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findById(userId)
  .then((user) => {
    Threads.find({
      '_id' : {$in: user.ThreadIdsAnswered},
    },function(err, docs){
      //Docs to return only the answer 
      //for all the thread, find the one user has answered
      obj = {}
      var tempX = 0
      for(var i = 0 ; i < docs.length; i++){
        for(var x = 0 ; x < docs[i].Answers.length; x++){
          if(docs[i].Answers[x].AnsweringUserId == userId){
            obj[tempX] = [docs[i].Answers[x], docs[i].Title]
            tempX++
          }
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type' , 'application/json');
      res.json(obj);
    })
  })
})


router.route('/getThreadForUserAnswersPosted')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findById(userId)
  .then((user) => {
    Threads.find({
      '_id' : {$in: user.ThreadIdsAnswered},
    },function(err, docs){
      //Docs to return only the answer 
      //for all the thread, find the one user has answered
      obj = {}
      var tempX = 0
      for(var i = 0 ; i < docs.length; i++){
        for(var x = 0 ; x < docs[i].Answers.length; x++){
          if(docs[i].Answers[x].AnsweringUserId == userId){
            obj[tempX] = [docs[i].Answers[x], docs[i].Title, docs[i]._id]
            tempX++
          }
        }
      }
      res.statusCode = 200;
      res.setHeader('Content-Type' , 'application/json');
      res.json(obj);
    })
  })
})

//For polling for notificaiton
router.route('/CheckNotification')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findById(userId)
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type' , 'application/json');
    res.json(user.NotificationNumber)
  })
})


//When client clicks on notification to reset
router.route('/RetrieveNotification')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  var TokenArray = req.headers.authorization.split(" ");
  var userId = authenticate.getUserId(TokenArray[1]);
  User.findByIdAndUpdate(userId)
  .then((user) => {
    var tempNotif = user.NotificationNumber
    obj = {}
    obj = [tempNotif,user.Notifications]
    user.NotificationNumber = 0;
    user.save()
    .then((user) => {
      res.statusCode = 200;
      res.setHeader('Content-Type' , 'application/json');
      res.json(obj)
    })
  })
})




module.exports = router;
