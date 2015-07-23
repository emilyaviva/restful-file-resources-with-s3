var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router;
var File = require('../models/file-model');

module.exports = function(router) {
  router.use(bodyParser.json());


};
