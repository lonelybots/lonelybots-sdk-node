/* eslint-env mocha */
var express = require('express')
var supertest = require('supertest')
var sinon = require('sinon')
var expect = require('chai').expect
var ArgumentException = require('../exceptions').ArgumentException
var botMiddleware = require('../../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).botMiddleware

describe('lonelybots.botMiddleware', function () {
  var testServer = null
  var fakeCallback = null
  var fakeGetAttachment = null

  beforeEach(function () {
    testServer = express()
    fakeCallback = sinon.spy()
    fakeGetAttachment = sinon.spy()

    testServer.use('/test', botMiddleware(fakeCallback, {
      getAttachment: fakeGetAttachment
    }))
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
        mailId: 'valid-mail-id',
        attachments: [
          {
            generatedFileName: 'valid-file-name1'
          },
          {
            generatedFileName: 'valid-file-name2'
          }
        ]
      })
      .expect(200)
      .end(function (err, response) {
        expect(err).to.be.null
        expect(fakeCallback.calledOnce).to.be.true
        var email = fakeCallback.firstCall.args[0]
        expect(email).to.not.be.null
        expect(email.attachments).to.have.lengthOf(2)
        expect(email.attachments[1]).to.have.property('get')
        expect(typeof email.attachments[1].get).to.equal('function')
        expect(fakeGetAttachment.calledOnce).to.be.false
        email.attachments[1].get()
        expect(fakeGetAttachment.calledOnce).to.be.true
        expect(fakeGetAttachment.calledWith(
          'valid-mail-id', 'valid-file-name2'))
        done()
      })
  })
})
