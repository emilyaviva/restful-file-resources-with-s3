var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router;

var User = require('../models/user-model');

function handleError() {
  return res.status(500).json({msg: 'server error'});
}

module.exports = function(router) {
  router.use(bodyParser.json());

  router.route('/users')
    .get(function(req, res) {
      User.find({}, function(err, users) {
        if (err) handleError();
        res.json(users);
      });
    })
    .post(function(req, res) {
      var user = new User(req.body);
      user.save(function(err, user) {
        if (err) handleError();
        res.json(user);
      });
    });

  router.route('/users/:user')
    .get(function(req, res) {
      var user = req.params.user;
      User.findOne({name:user}, function(err, data) {
        if (err) handleError();
        res.json(data);
    });
  })
    .delete(function(req, res) {
      var user = req.params.user;
      User.remove({name:user}, function(err, data) {
        if (err) handleError();
        res.json({msg:'user ' + user + ' deleted'});
    });
  });

};
