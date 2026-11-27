var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');

var newsRouter = require('./routes/news');
var authRouter = require('./routes/auth');
var projectsRouter = require('./routes/projects');
var publicationsRouter = require('./routes/publications');
var professorsRouter = require('./routes/professors');
var educationRouter = require('./routes/education');

var app = express();

mongoose.connect('mongodb://localhost:27017/Catedra_University')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(logger('dev'));
app.use(express.json());

app.use('/news', newsRouter);
app.use('/auth', authRouter);
app.use('/research/projects', projectsRouter);
app.use('/research/publications', publicationsRouter);
app.use('/professors', professorsRouter);
app.use('/education', educationRouter);

module.exports = app;
