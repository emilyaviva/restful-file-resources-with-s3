var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router;
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

var User = require('../models/user-model');

module.exports = function(router) {
  router.use(bodyParser.json());

  router.route('/users')
    .get(function(req, res) {
      User.find({}, function(err, users) {
        if (err) res.status(500).json({success: false, msg: 'server error'});
        res.json(users);
      });
    })
    .post(function(req, res) {
      var user = new User(req.body);
      user.save(function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg: 'server error'});
        else res.json({success: true, msg: 'Successfully created user ' + user.name});
      });
    });

  router.route('/users/:user')
    .get(function(req, res) {
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({msg: 'No such user'});
        else res.json(data);
      });
    })
    .delete(function(req, res) {
      var user = req.params.user;
      User.findOneAndRemove({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({success:false, msg: 'No such user'});
        else {
          var params = {Bucket: 'johncena/' + user._id};
          s3.deleteBucket(params, function(err, data) {
            if (err) res.status(500).json({success: false, msg: 'server error'});
            res.json({success: true, msg:'user ' + user + ' deleted'});
          });
        }
      });
    })
    .put(function(req, res) {
      var user = req.params.user;
      var newUser = req.body.name;
      User.findOneAndUpdate({name:user}, { $set: {name:newUser} }, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg: 'No such user'});
        else res.json({success: true, msg: 'User ' + user + ' has been updated to ' + newUser});
      });
    });

};
