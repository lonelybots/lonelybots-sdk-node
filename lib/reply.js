var _ = require('lodash')
var sendEmailFuncFactory = require('./send-email')

module.exports = function (options) {
  return function (originalEmail, outgoingEmail, dependencies) {
    var sendEmail = dependencies && dependencies.sendEmail
      ? dependencies.sendEmail
      : sendEmailFuncFactory(options)

    var out = {
      to: originalEmail.from,
      subject: outgoingEmail.subject ||
        (_.startsWith(originalEmail.subject, 'RE:')
        ? originalEmail.subject
        : 'RE: ' + originalEmail.subject),
      text: outgoingEmail.text,
      html: outgoingEmail.html,
      inReplyTo: originalEmail.messageId,
      references: _.union(
        originalEmail.references, [originalEmail.messageId]),
      attachments: outgoingEmail.attachments
    }

    return sendEmail(out)
  }
}
