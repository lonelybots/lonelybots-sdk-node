/* eslint-env mocha */
var express = require('express')
var supertest = require('supertest')
var sinon = require('sinon')
var expect = require('chai').expect
var runBot = require('../run-bot')

describe('lonelybots.runBot', function () {
  var testServer = null
  var fakeCallback = null
  var fakeGetAttachment = null
  var fakeReply = null
  var fakeCreateForm = null

  beforeEach(function () {
    testServer = express()
    fakeCallback = sinon.spy()
    fakeGetAttachment = sinon.spy()
    fakeReply = sinon.spy()
    fakeCreateForm = sinon.spy()

    testServer.use('/test', runBot({
      validationToken: 'test validation token',
      accessToken: 'test access token',
      callback: fakeCallback
    }, {
      getAttachment: fakeGetAttachment,
      reply: fakeReply,
      createForm: fakeCreateForm
    }))
  })

  it('should throw if no options provided', function () {
    expect(function () {
      runBot(/* no options provided here, which is wrong */)
    }).to.throw(Error)
  })

  it('should throw if no options.validationToken provided', function () {
    expect(function () {
      runBot({
        accessToken: 'test access token',
        callback: fakeCallback
      })
    }).to.throw(Error)
  })

  it('should throw if no options.accessToken provided', function () {
    expect(function () {
      runBot({
        validationToken: 'test validation token',
        callback: fakeCallback
      })
    }).to.throw(Error)
  })

  it('should throw if no options.callback provided', function () {
    expect(function () {
      runBot({
        validationToken: 'test validation token',
        accessToken: 'test access token'
      })
    }).to.throw(Error)
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

        expect(email).to.have.property('reply')
        expect(typeof email.reply).to.equal('function')
        email.reply({text: 'test reply'})
        expect(fakeReply.calledOnce).to.be.true

        expect(email).to.have.property('replyAll')
        expect(typeof email.replyAll).to.equal('function')
        email.replyAll({text: 'test reply'})
        expect(fakeReply.calledTwice).to.be.true

        expect(email).to.have.property('createForm')
        expect(typeof email.createForm).to.equal('function')
        email.createForm({title: 'test form'})
        expect(fakeCreateForm.calledOnce).to.be.true

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
