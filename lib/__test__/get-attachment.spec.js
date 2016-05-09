/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect

var getAttachment = require('../get-attachment')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
})

describe('lonelybots.getAttachment', function () {
  it('should throw if mailId is null', function (done) {
    getAttachment()
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if generatedFileName is null', function (done) {
    getAttachment('valid-mail-id')
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should send expected request to API endpoint', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    getAttachment(
      'valid-mail-id', 'valid-file-name', {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      expect(fakeRequestLibrary.calledWith({
        method: 'GET',
        url: 'http://api.lonelybots.com/attachment',
        headers: {
          Authorization: 'Bearer test access token'
        },
        qs: {
          mailId: 'valid-mail-id',
          generatedFileName: 'valid-file-name'
        }
      })).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
