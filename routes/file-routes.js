'use strict';

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
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg:'No such user'});
        else res.json({success: true, files: data.files});
      });
    })
    .post(function(req, res) {
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg: 'No such user'});
        else {
          var file = new File(req.body);
          var userID = data._id;
          var params = {Bucket: 'johncena', Key: userID + '/' + file.name, Body: file.body};
          s3.upload(params, function(err, data) {
            if (err || !data) res.status(500).json({success: false, msg: 'Server error'});
            else {
              User.findOneAndUpdate({_id: userID}, {$push: {files: file.name}}, function(err, data) {
                if (err || !data) res.status(500).json({success:false, msg:err});
                File.populate('creator');
              });
              res.json({success: true, msg: 'Successfully uploaded ' + file.name});
            }
          });
        }
      });
    })
    .delete(function(req, res) {
      var user = req.params.user;
      User.findOne({name: user}, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg: 'No such user'});
        else {
          var userID = data._id;
          if (!data.files.length) res.status(200).json({success: true, msg: 'No files to delete'});
          else {
            var params = {Bucket: 'johncena', Key: ''};
            for (var i = 0; i < data.files.length; i++) {
              params.Key = data._id + '/' + data.files[i];
              s3.deleteObject(params, function(err, data) {
                if (err || !data) res.status(500).json({success: false, msg: 'Server error'});
              });
            }
            User.findOneAndUpdate({_id: userID}, {$set: {files: []}}, function(err, data) {
              if (err || !data) res.status(500).json({success: false, msg:err});
              else res.json({success: true, msg: 'Deleted all files from ' + user});
            });
          }
        }
      });
    });

  router.route('/users/:user/files/:file')
    .get(function(req, res) {
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg:'No such user'});
        else {
          if (data.files.indexOf(req.params.file) < 0) {
            res.status(404).json({success: false, msg: 'File not found'});
          } else {
            var params = {Bucket: 'johncena', Key: data._id + '/' + req.params.file};
            s3.getSignedUrl('getObject', params, function(err, url) {
              if (err || !url) res.status(500).json({success: false, msg: 'Server error'});
              else res.json({success: true, url: url});
            });
          }
        }
      });
    })
    .put(function(req, res) {
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err || !data) res.status(500).json({success: false, msg: 'No such user'});
        else {
          if (data.files.indexOf(req.params.file) < 0) {
            res.status(404).json({success: false, msg: 'File not found'});
          } else {
            var userID = data._id;
            var file = new File(req.body);
            var params = {Bucket: 'johncena', Key: userID + '/' + file.name, Body: file.body};
            s3.upload(params, function(err, data) {
              if (err || !data) res.status(500).json({success: false, msg: 'Server error'});
              else {
                params = {Bucket: 'johncena', Key: userID + '/' + req.params.file};
                s3.deleteObject(params, function(err, data) {
                  if (err || !data) res.status(500).json({success: false, msg: 'Server error'});
                  else {
                    User.findOneAndUpdate({_id: userID}, {$pop: {files: req.params.file.name}}, function(err, data) {
                      if (err || !data) res.status(500).json({success: false, msg: err});
                      else User.findOneAndUpdate({_id: userID}, {$push: {files: file.name}}, function(err, data) {
                        if (err || !data) res.status(500).json({success: false, msg: err});
                        else res.json({success: true, msg: 'Successfully uploaded ' + file.name});
                      });
                    });
                  }
                });
              }
            });
          }
        }
      });
  });
};
