/* eslint-env mocha */
var express = require('express')
var supertest = require('supertest')
var sinon = require('sinon')
var expect = require('chai').expect
var ArgumentException = require('../exceptions').ArgumentException
var botMiddleware = require('../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).botMiddleware

describe('lonelybots.botMiddleware', function () {
  var testServer = null
  var fakeCallback = null

  beforeEach(function () {
    testServer = express()
    fakeCallback = sinon.spy()

    testServer.use('/test', botMiddleware(fakeCallback))
  })

  it('should throw if no callback provided', function () {
    expect(function () {
      botMiddleware(/* no callback provided here, which is wrong */)
    }).to.throw(ArgumentException)
  })

  it('should reject GET with invalid validation token', function (done) {
    supertest(testServer)
      .get('/test?response=whatever')
      .set('Authorization', 'wrong validation token')
      .send()
      .expect(401, done)
  })

  it('should handle GET with valid validation token', function (done) {
    supertest(testServer)
      .get('/test?response=expected+response')
      .set('Authorization', 'test validation token')
      .send()
      .expect(200, 'expected response', done)
  })

  it('should reject POST with invalid validation token', function (done) {
    supertest(testServer)
      .post('/test')
      .set('Authorization', 'wrong validation token')
      .send({
        some: 'payload'
      })
      .expect(401, done)
  })

  it('should handle POST with valid validation token', function (done) {
    supertest(testServer)
      .post('/test')
      .set('Authorization', 'test validation token')
      .send({
        some: 'email'
      })
      .expect(200)
      .end(function (err, response) {
        expect(err).to.be.null
        expect(fakeCallback.calledOnce).to.be.true
        expect(fakeCallback.calledWith({some: 'email'})).to.be.true
        done()
      })
  })
})
