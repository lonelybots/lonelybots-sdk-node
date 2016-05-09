var Promise = require('bluebird')
var requestLib = require('request')
var joi = require('joi')

var emailSchema = joi.object().required().keys({
  to: joi.array().required().min(1).items(joi.object().keys({
    address: joi.string().required(),
    name: joi.string().allow('')
  })),
  cc: joi.array().items(joi.object().keys({
    address: joi.string().required(),
    name: joi.string().allow('')
  })),
  bcc: joi.array().items(joi.object().keys({
    address: joi.string().required(),
    name: joi.string().allow('')
  })),
  subject: joi.string().required().min(1),
  text: joi.string().required().min(1),
  html: joi.string().allow(''),
  inReplyTo: joi.array().items(joi.string().allow('')),
  references: joi.array().items(joi.string()),
  attachments: joi.array().items(joi.object().keys({
    fileName: joi.string().required().min(1),
    contentId: joi.string().allow(''),
    contentType: joi.string().allow(''),
    content: joi.binary().required().encoding('utf8')
  }))
})

function validateEmail (email) {
  return joi.validate(email, emailSchema, {
    abortEarly: false
  })
}

module.exports = function (options) {
  // allow dependency injection for testability
  return function (email, dependencies) {
    return new Promise(function (resolve, reject) {
      var request = dependencies && dependencies.request
        ? dependencies.request
        : requestLib

      var validated = validateEmail(email)
      if (validated.error) {
        reject(validated.error)
        return
      }

      email = validated.value
      if (email.attachments) {
        for (var i = 0; i < email.attachments.length; i++) {
          email.attachments[i].content =
            email.attachments[i].content.toString('base64')
        }
      }

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
