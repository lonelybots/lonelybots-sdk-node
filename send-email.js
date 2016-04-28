var ArgumentException = require('./exceptions').ArgumentException
var Promise = require('bluebird')

// allow dependency injection for testability
module.exports = function (options, dependencies) {
  var request = dependencies.request || require('request')

  return function (email) {
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
        url: 'http://api.lonelybots.com/send',
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
