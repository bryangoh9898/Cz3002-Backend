const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Threads = require('../models/thread');
const thread = require('../models/thread');

const threadRouter = express.Router();

threadRouter.use(bodyParser.json());

//add cors for every route here

threadRouter.route('/')
.options(cors.cors, (req,res) => { res.sendStatus(200);  })
.get(cors.cors, (req,res,next) => {
    Threads.find({})
    .then((threads) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(threads);
    }, (err) => next(err))
    .catch((err) => next(err));
})
//This is to post a new post
// .post(cors.cors, authenticate.verifyUser, (req, res, next) => {
//     Threads.create(req.body)
//     .then((thread) => {
//         console.log('Post created', post);
//         res.statusCode = 200;
//         res.setHeader('Content-Type' , 'application/json');
//         res.json(thread);
//     }, (err) => next(err))
//     .catch((err) => next(err));
// });

//Retrieves all the threads inside a course
//Returns all the threads in order of dateTime , with the earliest above
threadRouter.route('/:CourseNumber')
.options(cors.cors, (req, res ) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Threads.find({CourseNumber: req.params.CourseNumber}).sort({createdAt: -1})
    .then((threads) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(threads);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Threads.deleteMany({})
    .then(() => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json("Successful");
    }, (err) => next(err))
    .catch((err) => next(err))
})

//Filters all the threads by its upvote
threadRouter.route('/api/FilterByUpvotes/:CourseNumber')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Threads.find({CourseNumber: req.params.CourseNumber}).sort({ThreadUpVotes: -1})
    .then((threads) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(threads);
    }, (err) => next(err))
    .catch((err) => next(err));
})

//Upvotes 
threadRouter.route('/api/Upvote/:ThreadId')
.options(cors.cors, (req, res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Threads.findByIdAndUpdate(req.params.ThreadId)
    .then((thread) => {
        var tempUpvote = thread.ThreadUpVotes;
        tempUpvote++;
        //update into thread and save
        thread.ThreadUpVotes = tempUpvote;
        thread.save()
        .then((thread) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(thread);
        }, (err) => next(err));    
    }, (err) => next(err))
    .catch((err) => next(err));
})

//Downvotes 
threadRouter.route('/api/Downvote/:ThreadId')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Threads.findByIdAndUpdate(req.params.ThreadId)
    .then((thread) => {
        var tempDownvote = thread.ThreadDownVotes;
        tempDownvote ++;
        thread.ThreadDownVotes = tempDownvote;
        thread.save()
        .then((thread) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(thread);
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
})


//This is for posting a new thread 
threadRouter.route('/PostNewThread')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.post(cors.cors, authenticate.verifyUser, (req,res,next) => {
    //This parses the token to find who's the corresponding user
    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);

    //I'll add this userId into the intialization of a new post
    Threads.create({
        CourseNumber: req.body.CourseNumber,
        Question: req.body.Question,
        OriginalUserId: userId,
        Faculty: req.body.Faculty,
        ThreadDownVotes: 0,
        ThreadUpVotes: 0,
        Answers: []
        //hidden username
    })
    .then((thread) => {
        console.log('New thread created' , thread);
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(thread);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = threadRouter;