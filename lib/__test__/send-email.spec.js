/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect
var ArgumentException = require('../exceptions').ArgumentException

var sendEmail = require('../../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).sendEmail

describe('lonelybots.sendEmail', function () {
  it('should throw if email is null', function () {
    expect(function () {
      sendEmail()
    }).to.throw(ArgumentException)
  })

  it('should throw if email is not an object', function () {
    expect(function () {
      sendEmail('this is not an object but a string')
    }).to.throw(ArgumentException)
  })

  it('should send expected request to API endpoint', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    sendEmail({some: 'email'}, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      expect(fakeRequestLibrary.calledWith({
        method: 'POST',
        url: 'http://api.lonelybots.com/send',
        json: true,
        headers: {
          Authorization: 'Bearer test access token'
        },
        body: {some: 'email'}
      })).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
