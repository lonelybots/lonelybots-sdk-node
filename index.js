var botMiddleware = require('./bot-middleware')
// var getAttachment = require('./get-attachment')
var sendEmail = require('./send-email')
var ArgumentException = require('./exceptions').ArgumentException

module.exports = function (options) {
  if (!options) {
    throw new ArgumentException('options', 'missing required arguments')
  }
  if (!options.validationToken) {
    throw new ArgumentException('options.validationToken', 'missing required arguments')
  }
  if (!options.accessToken) {
    throw new ArgumentException('options.accessToken', 'missing required arguments')
  }

  return {
    botMiddleware: botMiddleware(options),
    // getAttachment: getAttachment(options),
    sendEmail: sendEmail(options)
  }
}
