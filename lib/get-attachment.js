var ArgumentException = require('./exceptions').ArgumentException
var Promise = require('bluebird')
var requestLib = require('request')

module.exports = function (options) {
  // allow dependency injection for testability
  return function (mailId, generatedFileName, dependencies) {
    var request = dependencies && dependencies.request
      ? dependencies.request
      : requestLib

    if (!mailId) {
      throw new ArgumentException('mailId', 'missing required argument')
    }
    if (typeof mailId !== 'string') {
      throw new ArgumentException(
        'mailId', 'the 1st argument should be a string')
    }

    if (!generatedFileName) {
      throw new ArgumentException(
        'generatedFileName', 'missing required argument')
    }
    if (typeof generatedFileName !== 'string') {
      throw new ArgumentException(
        'generatedFileName', 'the 2nd argument should be a string')
    }

    return new Promise(function (resolve, reject) {
      request({
        method: 'GET',
        url: 'http://api.lonelybots.com/attachment',
        headers: {
          Authorization: 'Bearer ' + options.accessToken
        },
        qs: {
          mailId: mailId,
          generatedFileName: generatedFileName
        }
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
