var ArgumentException = require('./exceptions').ArgumentException
var Promise = require('bluebird')
var requestLib = require('request')

// allow dependency injection for testability
module.exports = function (options) {
  return function (email, dependencies) {
    var request = dependencies && dependencies.request
      ? dependencies.request
      : requestLib

    if (!email) {
      throw new ArgumentException('email', 'missing required argument')
    }
    if (typeof email !== 'object') {
      throw new ArgumentException(
        'email', 'the 1st argument should be an object')
    }

    return new Promise(function (resolve, reject) {
      request({
        method: 'POST',
        url: 'http://api.lonelybots.com/email',
        json: true,
        headers: {
          Authorization: 'Bearer ' + options.accessToken
        },
        body: email
      }, function (err, response, body) {
        if (err) {
          reject({
            error: err,
            response: response,
            body: body
          })
        } else {
          resolve({
            response: response,
            body: body
          })
        }
      })
    })
  }
}