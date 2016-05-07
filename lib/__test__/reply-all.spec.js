/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect
var ArgumentException = require('../exceptions').ArgumentException

var replyAll = require('../../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).replyAll

var validEmail = {
  from: [
    { address: 'test@lonelybots.com', name: 'test' }
  ],
  to: [
    { address: 'test@lonelybots.com', name: 'test' }
  ],
  subject: 'test',
  text: 'test',
  messageId: 'valid-message-id',
  conversationId: 'valid-conversation-id'
}
var validReply = {
  text: 'minimal reply'
}

describe('lonelybots.replyAll', function () {
  it('should throw if originalEmailis null', function () {
    expect(function () {
      replyAll()
    }).to.throw(ArgumentException)
  })

  it('should throw if originalEmail is not an object', function () {
    expect(function () {
      replyAll('will throw when the argument is a string like this')
    }).to.throw(ArgumentException)
  })

  it('should throw if outgoingEmail is not an object', function () {
    expect(function () {
      replyAll(validEmail, 'outgoing email')
    }).to.throw(ArgumentException)
  })

  it('should send expected request to API endpoint', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    replyAll(validEmail, validReply, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
