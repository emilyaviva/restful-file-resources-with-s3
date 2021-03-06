/* jshint expr: true */
'use strict';

var mongoose = require('mongoose');
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

var User = require('../models/user-model');

process.env.MONGO_FILESAPP_URI = 'mongodb://localhost/mongo_filesapp_test';
process.env.PORT = 3003;

chai.use(chaiHttp);

require('../server');

describe('user-model.js', function() {

  it('should create new resource for POST', function(done) {
    chai.request('localhost:3003')
        .post('/users')
        .send({name: 'test'})
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.name).to.eql('test');
          done();
    });
  });

  it('should respond to a GET request', function(done) {
    chai.request('localhost:3003')
        .get('/users')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(typeof res.body).to.eql('object');
          done();
    });
  });

  it('should GET a user by name', function(done) {
    chai.request('localhost:3003')
        .get('/users/test')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(typeof res.body).to.eql('object');
          expect(res.body.name).to.eql('test');
          done();
    });
  });
  
  it('should DELETE a user by name', function(done) {
    chai.request('localhost:3003')
        .delete('/users/test')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.msg).to.eql('user test deleted');
          done();
   });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() { done(); });
  });

});
