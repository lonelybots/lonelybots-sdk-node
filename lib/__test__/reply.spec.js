/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect

var reply = require('../reply')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
})

var validEmail = {
  from: [
    { address: 'test@lonelybots.com', name: '' }
  ],
  to: [
    { address: 'test@lonelybots.com', name: '' }
  ],
  headers: {
    to: 'test@lonelybots.com'
  },
  subject: 'test',
  text: 'test',
  messageId: 'valid-message-id',
  conversationId: 'valid-conversation-id'
}
var validReply = {
  text: 'minimal reply'
}

describe('lonelybots.reply', function () {
  it('should throw if originalEmailis null', function (done) {
    reply()
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if originalEmail is not an object', function (done) {
    reply('will throw when then argument is a string like this')
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should send expected request to API endpoint for replyAll', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    reply(validEmail, validReply, false, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })

  it('should send expected request to API endpoint for reply', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    reply(validEmail, validReply, true, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
