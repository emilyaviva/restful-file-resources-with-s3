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
          expect(res.body.success).to.be.true;
          expect(res.body.msg).to.eql('Successfully created user test');
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

  it('should update a user\'s name on a PUT request', function(done) {
    chai.request('localhost:3003')
        .put('/users/test')
        .send({name: 'test2'})
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.success).to.be.true;
          expect(res.body.msg).to.eql('User test has been updated to test2');
          done();
    });
  });

  it('should GET a user by name', function(done) {
    chai.request('localhost:3003')
        .get('/users/test2')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(typeof res.body).to.eql('object');
          expect(res.body.name).to.eql('test2');
          done();
    });
  });

  it('should DELETE a user by name', function(done) {
    chai.request('localhost:3003')
        .delete('/users/test2')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.msg).to.eql('user test2 deleted');
          done();
   });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() { done(); });
  });

});
