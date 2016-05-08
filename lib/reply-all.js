var _ = require('lodash')
var joi = require('joi')
var sendEmailFuncFactory = require('./send-email')
var ArgumentException = require('./exceptions').ArgumentException

var originalEmailSchema = joi.object().required().keys({
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
  text: joi.string().required().min(1),
  html: joi.string().allow(''),
  inReplyTo: joi.array().items(joi.string().allow('')),
  messageId: joi.string().required(),
  conversationId: joi.string().required(),
  references: joi.array().items(joi.string()),
  attachments: joi.array().items(joi.object().keys({
    fileName: joi.string().required().min(1),
    contentId: joi.string().allow(''),
    contentType: joi.string().allow(''),
    content: joi.binary().required().encoding('utf8')
  }))
})

var outgoingEmailSchema = joi.object().required().keys({
  subject: joi.string().min(1),
  text: joi.string().required().min(1),
  html: joi.string(),
  attachments: joi.array().items(joi.object().keys({
    fileName: joi.string().required().min(1),
    contentId: joi.string(),
    contentType: joi.string(),
    content: joi.binary().required().encoding('utf8')
  }))
})

function validateOriginalEmail (email) {
  return joi.validate(email, originalEmailSchema, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  })
}

function validateOutgoingEmail (email) {
  return joi.validate(email, outgoingEmailSchema, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  })
}

module.exports = function (options) {
  return function (originalEmail, outgoingEmail, dependencies) {
    var sendEmail = dependencies && dependencies.sendEmail
      ? dependencies.sendEmail
      : sendEmailFuncFactory(options)

    var validatedOriginal = validateOriginalEmail(originalEmail)
    if (validatedOriginal.error) {
      throw new ArgumentException(
        'originalEmail', validatedOriginal.error
      )
    }
    originalEmail = validatedOriginal.value

    var validatedOutgoing = validateOutgoingEmail(outgoingEmail)
    if (validatedOutgoing.error) {
      throw new ArgumentException(
        'outgoingEmail', validatedOutgoing.error
      )
    }
    outgoingEmail = validatedOutgoing.value

    var out = {
      to: _.unionWith(originalEmail.to, originalEmail.from, _.isEqual),
      cc: originalEmail.cc,
      subject: outgoingEmail.subject ||
        (_.startsWith(originalEmail.subject, 'RE:')
        ? originalEmail.subject
        : 'RE: ' + originalEmail.subject),
      text: outgoingEmail.text,
      html: outgoingEmail.html,
      inReplyTo: [originalEmail.messageId],
      references: _.union(
        originalEmail.references, [originalEmail.messageId]),
      attachments: outgoingEmail.attachments
    }

    return sendEmail(out, dependencies)
  }
}
