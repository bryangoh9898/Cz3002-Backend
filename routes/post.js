const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Posts = require('../models/post');

const postRouter = express.Router();

postRouter.use(bodyParser.json());

//add cors for every route here

postRouter.route('/')
.options(cors.cors, (req,res) => { res.sendStatus(200);  })
.get(cors.cors, (req,res,next) => {
    Posts.find({})
    .then((posts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(posts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Posts.create(req.body)
    .then((post) => {
        console.log('Post created', post);
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(post);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = postRouter;