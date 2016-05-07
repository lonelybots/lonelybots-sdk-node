/* eslint-env mocha */
var sinon = require('sinon')
var expect = require('chai').expect
var ArgumentException = require('../exceptions').ArgumentException

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
  text: 'test'
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
  it('should throw if originalEmail is null', function () {
    expect(function () {
      createForm()
    }).to.throw(ArgumentException)
  })

  it('should throw if originalEmail is not valid', function () {
    expect(function () {
      createForm('will throw when the argument is a string like this')
    }).to.throw(ArgumentException)
  })

  it('should throw if form is not valid', function () {
    expect(function () {
      createForm(validEmail, {
        notitle: 'the key of this property is wrong',
        nofields: {}
      })
    }).to.throw(ArgumentException)
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
            subject: 'test'
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