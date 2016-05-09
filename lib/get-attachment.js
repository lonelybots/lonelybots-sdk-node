var Promise = require('bluebird')
var requestLib = require('request')

module.exports = function (options) {
  // allow dependency injection for testability
  return function (mailId, generatedFileName, dependencies) {
    return new Promise(function (resolve, reject) {
      var request = dependencies && dependencies.request
        ? dependencies.request
        : requestLib

      if (!mailId) {
        reject(new Error('missing required argument mailId'))
        return
      }
      if (typeof mailId !== 'string') {
        reject(new Error('the 1st argument should be a string'))
        return
      }

      if (!generatedFileName) {
        reject(new Error('missing required argument generatedFileName'))
        return
      }
      if (typeof generatedFileName !== 'string') {
        reject(new Error('the 2nd argument should be a string'))
        return
      }

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
          reject(new Error({
            error: err,
            response: response,
            body: body
          }))
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
