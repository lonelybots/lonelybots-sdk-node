/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect

var replyAll = require('../../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).replyAll

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

describe('lonelybots.replyAll', function () {
  it('should throw if originalEmailis null', function (done) {
    replyAll()
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if originalEmail is not an object', function (done) {
    replyAll('will throw when then argument is a string like this')
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if outgoingEmail is not an object', function (done) {
    replyAll(validEmail, 'outgoing email')
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should send expected request to API endpoint', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    replyAll(validEmail, validReply, false, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
