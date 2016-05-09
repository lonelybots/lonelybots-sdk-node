/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect

var sendEmail = require('../../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).sendEmail

var validEmail = {
  to: [
    { address: 'test@lonelybots.com', name: 'test' }
  ],
  subject: 'test',
  text: 'test'
}

describe('lonelybots.sendEmail', function () {
  it('should throw if email is null', function (done) {
    sendEmail()
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if email is not an object', function (done) {
    sendEmail('will throw when the argument is a string like this')
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should send expected request to API endpoint', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    sendEmail(validEmail, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      expect(fakeRequestLibrary.calledWith({
        method: 'POST',
        url: 'http://api.lonelybots.com/email',
        json: true,
        headers: {
          Authorization: 'Bearer test access token'
        },
        body: validEmail
      })).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
