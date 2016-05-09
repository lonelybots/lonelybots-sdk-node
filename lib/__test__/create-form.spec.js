/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect

var createForm = require('../../index')({
  validationToken: 'test validation token',
  accessToken: 'test access token'
}).createForm

var validEmail = {
  from: [
    { address: 'test@lonelybots.com', name: 'test' }
  ],
  to: [
    { address: 'test@lonelybots.com', name: 'test' }
  ],
  subject: 'test',
  text: 'test',
  conversationId: 'valid-conversation-id'
}
var validForm = {
  title: 'test form',
  fields: {
    field1: {
      display: 'test field 1',
      type: 'string'
    }
  }
}

describe('lonelybots.createForm', function () {
  it('should throw if originalEmail is null', function (done) {
    createForm()
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if originalEmail is not valid', function (done) {
    createForm('will throw when the argument is a string like this')
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should throw if form is not valid', function (done) {
    createForm(validEmail, {
      notitle: 'the key of this property is wrong',
      nofields: {}
    })
    .then(() => {
      done(new Error('did not throw expected exception'))
    })
    .catch(() => {
      done()
    })
  })

  it('should send expected request to API endpoint', function (done) {
    var fakeRequestLibrary = sinon.stub().callsArg(1)
    createForm(validEmail, validForm, {request: fakeRequestLibrary})
    .then(function () {
      expect(fakeRequestLibrary.calledOnce).to.be.true
      expect(fakeRequestLibrary.calledWith({
        method: 'POST',
        url: 'http://api.lonelybots.com/form',
        json: true,
        headers: {
          Authorization: 'Bearer test access token'
        },
        body: {
          title: 'test form',
          mail: {
            from: [
              { address: 'test@lonelybots.com', name: 'test' }
            ],
            to: [
              { address: 'test@lonelybots.com', name: 'test' }
            ],
            subject: 'test',
            conversationId: 'valid-conversation-id'
          },
          fields: {
            field1: {
              display: 'test field 1',
              type: 'string'
            }
          }
        }
      })).to.be.true
      done()
    })
    .catch(function (err) {
      done(err)
    })
  })
})
