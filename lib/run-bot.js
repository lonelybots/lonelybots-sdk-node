var _ = require('lodash')
var express = require('express')
var getAttachmentFuncFactory = require('./get-attachment')
var replyFuncFactory = require('./reply')
var createFormFuncFactory = require('./create-form')
var bodyParser = require('body-parser').json()

module.exports = function (options, dependencies) {
  // validate input arguments
  if (!options) {
    throw new Error('missing required argument options')
  }
  if (!options.validationToken) {
    throw new Error('missing required argument options.validationToken')
  }
  if (!options.accessToken) {
    throw new Error('missing required argument options.accessToken')
  }

  if (!options.callback) {
    throw new Error('missing required argument options.callback')
  }
  if (typeof options.callback !== 'function') {
    throw new Error('options.callback must be a function')
  }

  // allow dependency injection for testability
  var getAttachment = dependencies && dependencies.getAttachment
    ? dependencies.getAttachment
    : getAttachmentFuncFactory(options)

  var reply = dependencies && dependencies.reply
    ? dependencies.reply
    : replyFuncFactory(options)

  var createForm = dependencies && dependencies.createForm
    ? dependencies.createForm
    : createFormFuncFactory(options)

  // sets up the result express middleware
  var router = express.Router()

  // GET requests are for ownership validation
  router.get('/', function (req, res, next) {
    if (req.get('authorization') === options.validationToken) {
      res.send(req.query['response'])
    } else {
      res.status(401).send('validation token mismatch')
    }
  })

  // POST requests are receiving emails
  router.post('/', bodyParser, function (req, res, next) {
    if (req.get('authorization') === options.validationToken) {
      var mail = _.cloneDeep(req.body)

      mail.reply = function (outgoingEmail) {
        return reply(mail, outgoingEmail, true)
      }
      mail.replyAll = function (outgoingEmail) {
        return reply(mail, outgoingEmail, false)
      }
      mail.createForm = function (form) {
        return createForm(mail, form)
      }

      if (mail.attachments) {
        _.each(mail.attachments, function (attachment) {
          attachment.get = (function (mailId, generatedFileName) {
            return function () {
              return getAttachment(
                mailId, generatedFileName, dependencies)
            }
          })(mail.id, attachment.generatedFileName)
        })
      }
      options.callback(mail)
      res.status(200).send('OK')
    } else {
      res.status(401).send('validation token mismatch')
    }
  })

  return router
}
