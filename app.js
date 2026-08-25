var express = require('express');
var logger = require('morgan');
var mongoose = require('mongoose');

var newsRouter = require('./routes/news');
var authRouter = require('./routes/auth');

var app = express();

mongoose.connect('mongodb://localhost:27017/Catedra_University')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(logger('dev'));
app.use(express.json());

app.use('/news', newsRouter);
app.use('/auth', authRouter);

module.exports = app;
