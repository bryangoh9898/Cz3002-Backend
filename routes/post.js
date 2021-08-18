const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Posts = require('../models/post');

const postRouter = express.Router();

postRouter.use(bodyParser.json());

postRouter.route('/')
.get((req,res,next) => {
    Posts.find({})
    .then((posts) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(posts);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
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