var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router;
var User = require('../models/user-model');
var File = require('../models/file-model');
var AWS = require('aws-sdk');

AWS.config.loadFromPath('./credentials/config.json');
var s3 = new AWS.S3();

module.exports = function(router) {
  router.use(bodyParser.json());

  router.route('/users/:user/files')
    .get(function(req, res) {
      var user = req.body.user;
      User.findOne({name:user}, function(err, data) {

      });
    })
    .post(function(req, res) {
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg: 'No such user'});
        else {
          var file = new File(req.body);
          var params = {Bucket: 'johncena', Key: data._id + '/' + file.name, Body: file.body};
          s3.upload(params, function(err, data) {
            if (err || !data) res.status(500).json({success: false, msg: 'Server error'});
            else res.json({success: true, msg: 'Successfully uploaded ' + file.name});
          });
        }
      });
    })
    .delete(function(req, res) {

    });

  router.route('/users/:user/files/:file')
    .get(function(req, res) {

    })
    .put(function(req, res) {

    });
};
