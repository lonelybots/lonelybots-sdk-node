var replyAllFuncFactory = require('./reply-all')

module.exports = function (options) {
  const replyAll = replyAllFuncFactory(options)
  return function (originalEmail, outgoingEmail, dependencies) {
    return replyAll(originalEmail, outgoingEmail, true, dependencies)
  }
}
