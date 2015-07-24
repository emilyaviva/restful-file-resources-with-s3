'use strict';

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

//var mongoURI = process.env.MONGO_FILESAPP_URI //|| 'mongodb://localhost/filesApp';
var mongoURI = 'mongodb://localhost/filesApp';

var userRoutes = express.Router();
var fileRoutes = express.Router();
require('./routes/user-routes')(userRoutes);
require('./routes/file-routes')(fileRoutes);
app.use('/', userRoutes);
app.use('/', fileRoutes);

mongoose.connect(mongoURI, function(err) {
  if (err) console.log('error: ' + err);
  else console.log('MongoDB connection successful');
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Server listening on port ' + port);
});
