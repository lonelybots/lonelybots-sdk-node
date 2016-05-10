var _ = require('lodash')
var joi = require('joi')
var sendEmailFuncFactory = require('./send-email')

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

const COUNTER_SUFFIX = '@bot-message-counter.lonelybots.com'

module.exports = function (options) {
  return function (originalEmail, outgoingEmail, onlyToSender, dependencies) {
    return new Promise(function (resolve, reject) {
      var sendEmail = dependencies && dependencies.sendEmail
        ? dependencies.sendEmail
        : sendEmailFuncFactory(options)

      var validatedOriginal = validateOriginalEmail(originalEmail)
      if (validatedOriginal.error) {
        reject(validatedOriginal.error)
        return
      }
      originalEmail = validatedOriginal.value

      var botMessageCount = 1
      if (originalEmail.references) {
        const lastRef =
          originalEmail.references[originalEmail.references.length - 1]
        if (_.endsWith(lastRef, COUNTER_SUFFIX)) {
          botMessageCount = _.toInteger(_.split(lastRef, '@', 1)[0]) + 1
        }

        originalEmail.references = _.filter(originalEmail.references,
          (ref) => !_.endsWith(ref, COUNTER_SUFFIX))
      }

      if (botMessageCount >= 16) {
        reject({
          message: 'enough talking among bots'
        })
        return
      }

      if (typeof outgoingEmail === 'string') {
        outgoingEmail = {
          text: outgoingEmail
        }
      }
      var validatedOutgoing = validateOutgoingEmail(outgoingEmail)
      if (validatedOutgoing.error) {
        reject(validatedOutgoing.error)
        return
      }
      outgoingEmail = validatedOutgoing.value

      var out = {
        to: onlyToSender
          ? originalEmail.from
          : _.unionWith(originalEmail.to, originalEmail.from, _.isEqual),
        cc: onlyToSender ? null : originalEmail.cc,
        subject: outgoingEmail.subject ||
          (_.startsWith(originalEmail.subject, 'RE:')
          ? originalEmail.subject
          : 'RE: ' + originalEmail.subject),
        text: outgoingEmail.text,
        html: outgoingEmail.html,
        inReplyTo: [originalEmail.messageId],
        references: _.union(
          originalEmail.references,
          [
            originalEmail.messageId,
            _.toString(botMessageCount) + COUNTER_SUFFIX
          ]),
        attachments: outgoingEmail.attachments
      }

      resolve(sendEmail(out, dependencies))
    })
  }
}
