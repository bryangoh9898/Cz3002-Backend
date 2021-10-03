const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Threads = require('../models/thread');
const Users = require('../models/user');
const thread = require('../models/thread');

const threadRouter = express.Router();

threadRouter.use(bodyParser.json());

//add cors for every route here

threadRouter.route('/getAllThreads')
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


//Retrieves a specific thread by its ID 
threadRouter.route('/getAllThreads/:threadId')
.options(cors.cors, (req, res ) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    console.log('Printing' + req.params.threadId);
    console.log('Comes here');
    Threads.findById(req.params.threadId)
    .then((thread) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(thread);
    }, (err) => next(err))
    .catch((err) => next(err));
})

//Retrieves the lastest threads for the main page
threadRouter.route('/getLatestThreads/:NumberOfLatest')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req ,res ,next) => {
    Threads.find({}).sort({createdAt: -1}).limit(parseInt(req.params.NumberOfLatest, 10))
    .then((threads) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(threads);
    }, (err) => next(err))
    .catch((err) => next(err));
})



//Retrieves all the threads inside a course
//Returns all the threads in order of dateTime , with the earliest above
threadRouter.route('/:CourseNumber')
.options(cors.cors, (req, res ) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    //CAPS FIRST 2 letters of req.params.CourseNumber
    const courseNum = req.params.CourseNumber.charAt(0).toUpperCase() + req.params.CourseNumber.charAt(1).toUpperCase() + req.params.CourseNumber.slice(2);
    Threads.find({CourseNumber: courseNum}).sort({createdAt: -1})
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


//This is for posting a new thread 
threadRouter.route('/PostNewThread')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.post(cors.cors, authenticate.verifyUser, (req,res,next) => {
    //This parses the token to find who's the corresponding user
    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    //I'll save the username from the user 
    //I'll add this userId into the intialization of a new post
    Users.findById(userId)
    .then((user) => {
        Threads.create({
            CourseNumber: req.body.CourseNumber,
            Question: req.body.Question,
            OriginalUserId: userId,
            Faculty: req.body.Faculty,
            ThreadDownVotes: 0,
            ThreadUpVotes: 0,
            Answers: [],
            UsersWhoDownVoted: [],
            UsersWhoUpvoted: [],
            OriginalUserName: user.username,
            Title: req.body.Title 
            //hidden username
        })
        .then((thread) => {
            console.log('New thread created' , thread);
            res.statusCode = 200;
            res.setHeader('Content-Type' , 'application/json');
            res.json(thread);
        }, (err) => next(err))
        .catch((err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));

});


//This is for answering a thread
threadRouter.route('/AnswerThread/:ThreadId')
.options(cors.cors, (req,res) => {res.sendStatus(200); })
.post(cors.cors, authenticate.verifyUser, (req,res,next) => {
    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    Users.findById(userId)
    .then((user) => {
        Threads.findById(req.params.ThreadId)
        .then((thread) => {
            if(thread == null)
            {
                err = new Error('Thread ' + req.params.ThreadId + ' not found');
                err.status = 404;
                return next(err);
            }
            var newAnswer = {
                AnsweringUserId: userId,
                Answer: req.body.Answers,
                AnsweringUserName: user.username,
                Downvote: 0,
                Upvote: 0,
                UsersWhoUpvotedAnswer: [],
                UsersWhoDownVotedAnswer: [],
            }
            thread.Answers.push(newAnswer);
            thread.save()
            .then((thread) => {
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.json(thread);
            })
        }, (err) => next(err))
        .catch((err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
  
})

/* --------------------------API calls-------------------------------- */

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


//Retrieves the highest upvotes for the main page
threadRouter.route('/api/getHighestUpvotesThread/:NumberOfThreads')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Threads.find({}).sort({ThreadUpVotes: -1}).limit(parseInt(req.params.NumberOfThreads))
    .then((threads) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(threads);
    }, (err) => next(err))
    .catch((err) => next(err));
})


//Upvotes for the question
threadRouter.route('/api/Upvote/:ThreadId')
.options(cors.cors, (req, res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {
    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);

    Threads.findByIdAndUpdate({"_id": req.params.ThreadId})
    .then((thread) => {

        for(let j = 0 ; j < thread.UsersWhoUpvoted.length; j++){
            if(thread.UsersWhoUpvoted[j] === userId){
                res.statusCode = 500;
                res.json("Error, user has already upvoted previously");
                return res
            }
        }       
   
        for(let i = 0 ; i < thread.UsersWhoDownVoted.length; i++){
            if(thread.UsersWhoDownVoted[i] === userId){
                var tempDownVote = thread.ThreadDownVotes;
                tempDownVote--;
                thread.ThreadDownVotes = tempDownVote;
                //remove user from the list 
                thread.UsersWhoDownVoted.pull(userId);
            }
        }
     
        var tempUpvote = thread.ThreadUpVotes;
        tempUpvote++;
        //update into thread and save
        thread.ThreadUpVotes = tempUpvote;
        thread.UsersWhoUpvoted.push(userId);
        thread.save()
        .then((thread) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(thread);
        }, (err) => next(err)); 
    }, (err) => next(err))
    .catch((err) => next(err));
})

//Downvotes for the question
threadRouter.route('/api/Downvote/:ThreadId')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {

    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    Threads.findByIdAndUpdate({"_id": req.params.ThreadId})
    .then((thread) => {

        for(let j = 0 ; j < thread.UsersWhoDownVoted.length; j++){
            if(thread.UsersWhoDownVoted[j] === userId){
                res.statusCode = 500;
                res.json("Error, User has already downvoted this thread");
                return res;
            }
        }
       
        for(let i = 0 ; i < thread.UsersWhoUpvoted.length; i++){
            if(thread.UsersWhoUpvoted[i] === userId){
                var tempUpVote = thread.ThreadUpVotes;
                tempUpVote--;
                thread.ThreadUpVotes = tempUpVote;
                //remove user from the list 
                thread.UsersWhoUpvoted.pull(userId);
            }
        }
      
        var tempDownvote = thread.ThreadDownVotes;
        tempDownvote++;
        thread.ThreadDownVotes = tempDownvote;
        thread.UsersWhoDownVoted.push(userId);
        thread.save()
        .then((thread) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(thread);
        }, (err) => next(err));
    }, (err) => next(err))
    .catch((err) => next(err));
})

//Resets their votes for a question
threadRouter.route('/api/ResetVote/:ThreadId')
.options(cors.cors, (req, res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {
    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    Threads.findByIdAndUpdate({"_id": req.params.ThreadId})
    .then((thread) => {

        var status = 0; 

        for(let j = 0 ; j < thread.UsersWhoDownVoted.length; j++){
            if(thread.UsersWhoDownVoted[j] === userId){
               //user has downvote and we want to reset this 
               var tempDownVote = thread.ThreadDownVotes;
               tempDownVote --;
               thread.ThreadDownVotes = tempDownVote;
               thread.UsersWhoDownVoted.pull(userId);
               status = 1; 
            }
        }

        if(status == 0)
        {       
            for(let i = 0 ; i < thread.UsersWhoUpvoted.length; i++){
                if(thread.UsersWhoUpvoted[i] === userId){
                    var tempUpVote = thread.ThreadUpVotes;
                    tempUpVote--;
                    thread.ThreadUpVotes = tempUpVote;
                    //remove user from the list 
                    thread.UsersWhoUpvoted.pull(userId);
                    status = 1;
                }
            }
        }
        
        if(status == 0)
        {
            //user has not voted/downvoted
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json("User has not voted or downvoted this question so invalid function")
        }
        else{
            thread.save()
            .then((thread) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(thread);    
            }, (err) => next(err))
            .catch((err) => next(err));
        }


    }, (err) => next(err))
    .catch((err) => next(err));
})


//This is for downvoting an ANSWER
threadRouter.route('/api/Downvote/:ThreadId/Answers/:AnswersId')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {

    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    Threads.findByIdAndUpdate({"_id": req.params.ThreadId})
    .then((thread) => {
        //Sanity check for if the user has already downvoted
        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswersId){
                for(let j = 0 ; j < thread.Answers[i].UsersWhoDownVotedAnswer.length; j++){
                    //I'll check if this user has voted before
                    if(thread.Answers[i].UsersWhoDownVotedAnswer[j] == userId){
                        res.statusCode = 500;
                        res.json("Error, use has already downvoted before");
                        return res;
                    }
                }
            }
        }
        //check if he has upvoted previously
        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswersId){
                for(let j = 0 ; j < thread.Answers[i].UsersWhoUpvotedAnswer.length; j++){
                    if(thread.Answers[i].UsersWhoUpvotedAnswer[j] == userId){
                        var tempUpVote = thread.Answers[i].Upvote;
                        tempUpVote--;
                        thread.Answers[i].Upvote = tempUpVote;
                        thread.Answers[i].UsersWhoUpvotedAnswer.pull(userId);
                    }
                }
            }
        }
        
        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswersId){
                var tempDownVote = thread.Answers[i].Downvote
                tempDownVote++;
                thread.Answers[i].Downvote = tempDownVote;
                thread.Answers[i].UsersWhoDownVotedAnswer.push(userId);
                thread.save()
                .then((thread) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(thread);
                }, (err) => next(err))
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})


//This is for upvoting an ANSWER
threadRouter.route('/api/Upvote/:ThreadId/Answers/:AnswersId')
.options(cors.cors, (req,res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {

    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    Threads.findByIdAndUpdate({"_id": req.params.ThreadId})
    .then((thread) => {
        //Sanity check for if the user has already upvoed
        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswersId){
                for(let j = 0 ; j < thread.Answers[i].UsersWhoUpvotedAnswer.length; j++){
                    //I'll check if this user has voted before
                    if(thread.Answers[i].UsersWhoUpvotedAnswer[j] == userId){
                        res.statusCode = 500;
                        res.json("Error, use has already upvoted before");
                        return res;
                    }
                }
            }
        }

        //check if he has downvoted previously
        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswersId){
                for(let j = 0 ; j < thread.Answers[i].UsersWhoDownVotedAnswer.length; j++){
                    if(thread.Answers[i].UsersWhoDownVotedAnswer[j] == userId){
                        var tempDownVote = thread.Answers[i].Downvote;
                        tempDownVote--;
                        thread.Answers[i].Downvote = tempDownVote;
                        thread.Answers[i].UsersWhoDownVotedAnswer.pull(userId);
                    }
                }
            }
        }
        
        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswersId){
                var tempUpVote = thread.Answers[i].Upvote
                tempUpVote++;
                thread.Answers[i].Upvote = tempUpVote;
                thread.Answers[i].UsersWhoUpvotedAnswer.push(userId);
                thread.save()
                .then((thread) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(thread);
                }, (err) => next(err))
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})

//Resets their votes for an answer
threadRouter.route('/api/ResetVote/:ThreadId/Answers/:AnswerId')
.options(cors.cors, (req, res) => {res.sendStatus(200);})
.put(cors.cors, authenticate.verifyUser, (req,res,next) => {
    var TokenArray = req.headers.authorization.split(" ");
    var userId = authenticate.getUserId(TokenArray[1]);
    Threads.findByIdAndUpdate({"_id": req.params.ThreadId})
    .then((thread) => {
        var status = 0; 

        for(let i = 0 ; i < thread.Answers.length; i++){
            if(thread.Answers[i]._id == req.params.AnswerId){
                for(let j = 0 ; j < thread.Answers[i].UsersWhoDownVotedAnswer.length; j++){
                    if(thread.Answers[i].UsersWhoDownVotedAnswer[j] == userId){
                        var tempDownVote = thread.Answers[i].Downvote;
                        tempDownVote--;
                        thread.Answers[i].Downvote = tempDownVote;
                        thread.Answers[i].UsersWhoDownVotedAnswer.pull(userId);
                        status = 1;
                    }
                }

                if(status == 0)
                {
                    for(let k = 0; k < thread.Answers[i].UsersWhoUpvotedAnswer.length; k++)
                    {
                        var tempUpVote = thread.Answers[i].Upvote;
                        tempUpVote--;
                        thread.Answers[i].Upvote = tempUpVote;
                        thread.Answers[i].UsersWhoUpvotedAnswer.pull(userId);
                        status =1;
                    }
                }

                if(status == 0)
                {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json("User has not voted or downvoted this question so invalid function") 
                }
                else
                {
                    thread.save()
                    .then((thread) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(thread);    
                    }, (err) => next(err))
                    .catch((err) => next(err));
                }

            }
        }


    }, (err) => next(err))
    .catch((err) => next(err));
})




module.exports = threadRouter;