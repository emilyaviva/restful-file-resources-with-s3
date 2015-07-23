var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var router = express.Router;
var User = require('../models/user-model');

module.exports = function(router) {
  router.use(bodyParser.json());

  router.route('/users')
    .get(function(req, res) {
      User.find({}, function(err, users) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(users);
      });
    })
    .post(function(req, res) {
      var user = new User(req.body);
      user.save(function(err, user) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(user);
      });
    });

};
