const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Faculty = require('../models/faculty');

const FacultyRouter = express.Router();


FacultyRouter.use(bodyParser.json());


//retrieves all the coursecode for a faculty
FacultyRouter.route('/')
.options(cors.cors, (req,res) => { res.sendStatus(200);  })
.get(cors.cors , (req,res,next) => {
    Faculty.find({})
    .then((faculties) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(faculties);
    },(err) => next(err))
    .catch((err) => next(err));
})
.post(cors.cors, (req,res,next) => {
    Faculty.create(req.body)
    .then((faculty) => {
        console.log('faculty created', faculty);
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(faculty);
    }, (err) => next(err))
    .catch((err) => next(err));
});


FacultyRouter.route('/:facultyName')
.options(cors.cors, (req,res) => { res.sendStatus(200);  })
.get(cors.cors , (req,res,next) => {
    Faculty.findOne({FacultyName: req.params.facultyName})
    .then((faculty) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(faculty);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.cors, (req,res,next) => {
    Faculty.findOneAndUpdate({FacultyName: req.params.facultyName})
    .then((faculty) => {
        console.log("The value of coursecode is " + req.body.CourseCode);
        faculty.CourseCode.push(req.body.CourseCode);
        faculty.save();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(faculty);
    }, (err) => next(err))
    .catch((err)=> next(err));
})
.delete(cors.cors, (req,res,next) =>{
    Faculty.deleteOne({FacultyName: req.params.facultyName})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type' , 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = FacultyRouter;