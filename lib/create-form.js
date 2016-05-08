var ArgumentException = require('./exceptions').ArgumentException
var Promise = require('bluebird')
var requestLib = require('request')
var joi = require('joi')

var formSchema = joi.object().required().keys({
  title: joi.string().required().min(1),
  mail: joi.object().required().keys({
    from: joi.array().required().min(1).items(joi.object().keys({
      address: joi.string().required(),
      name: joi.string().allow('')
    })),
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
    inReplyTo: joi.array().items(joi.string().allow('')),
    references: joi.array().items(joi.string())
  }),
  fields: joi.object().required().pattern(/.+/, joi.object({
    display: joi.string().required().min(1),
    description: joi.string().allow(''),
    type: joi.string().allow('')
  }))
})

function validateForm (form) {
  return joi.validate(form, formSchema, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  })
}

module.exports = function (options) {
  // allow dependency injection for testability
  return function (originalEmail, form, dependencies) {
    var request = dependencies && dependencies.request
      ? dependencies.request
      : requestLib

    form = form || {}
    form.mail = originalEmail

    var validated = validateForm(form)
    if (validated.error) {
      throw new ArgumentException(
        'originalEmail / form', validated.error
      )
    }

    form = validated.value

    return new Promise(function (resolve, reject) {
      request({
        method: 'POST',
        url: 'http://api.lonelybots.com/form',
        json: true,
        headers: {
          Authorization: 'Bearer ' + options.accessToken
        },
        body: form
      }, function (err, response, body) {
        if (err) {
          reject({
            error: err,
            response: response,
            body: body
          })
        } else {
          resolve('http://www.lonelybots.com/f/' + body)
        }
      })
    })
  }
}
