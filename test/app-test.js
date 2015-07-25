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
  this.timeout(5000);

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

  it('should DELETE a user with no files by name', function(done) {
    chai.request('localhost:3003')
        .delete('/users/test2')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.success).to.be.true;
          expect(res.body.msg).to.eql('user test2 deleted (empty)');
          done();
    });
  });

  it('should create a new user', function(done) {
    chai.request('localhost:3003')
        .post('/users')
        .send({name: 'test3'})
        .end(function(err, res) {
          expect(err).to.eql(null);
          done();
      });
    });

    it('should upload a file to that new user', function(done) {
      chai.request('localhost:3003')
          .post('/users/test3/files')
          .send({name: 'testfile.txt', body: '12345'})
          .end(function(err, res) {
            expect(err).to.eql(null);
            expect(res.body.success).to.be.true;
            expect(res.body.msg).to.eql('Successfully uploaded testfile.txt');
            done();
    });
  });

  it('should get an array containing files that a user owns', function(done) {
    chai.request('localhost:3003')
        .get('/users/test3/files')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.success).to.be.true;
          expect(res.body.files.length).to.be.above(0);
          done();
    });
  });

  it('should GET a URL for some specific file', function(done) {
    chai.request('localhost:3003')
        .get('/users/test3/files/testfile.txt')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.success).to.be.true;
          var spl = res.body.url.split('?')[1].split('&');
          expect(spl).to.have.length(3);
          expect(spl[0].slice(0,15)).to.eql('AWSAccessKeyId=');
          expect(spl[1].slice(0,8)).to.eql('Expires=');
          expect(spl[2].slice(0,10)).to.eql('Signature=');
          done();
    });
  });

  it('should delete a user who owns files by name', function(done) {
    chai.request('localhost:3003')
        .delete('/users/test3')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.body.success).to.be.true;
          expect(res.body.msg).to.eql('user test3 deleted');
          done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() { done(); });
  });

});
