var botMiddleware = require('./lib/bot-middleware')
var getAttachment = require('./lib/get-attachment')
var sendEmail = require('./lib/send-email')
var reply = require('./lib/reply')
var replyAll = require('./lib/reply-all')
var createForm = require('./lib/create-form')
var ArgumentException = require('./lib/exceptions').ArgumentException

module.exports = function (options) {
  if (!options) {
    throw new ArgumentException('options', 'missing required arguments')
  }
  if (!options.validationToken) {
    throw new ArgumentException(
      'options.validationToken', 'missing required arguments')
  }
  if (!options.accessToken) {
    throw new ArgumentException(
      'options.accessToken', 'missing required arguments')
  }

  return {
    botMiddleware: botMiddleware(options),
    getAttachment: getAttachment(options),
    sendEmail: sendEmail(options),
    reply: reply(options),
    replyAll: replyAll(options),
    createForm: createForm(options)
  }
}
