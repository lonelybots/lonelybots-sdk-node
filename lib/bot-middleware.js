var _ = require('lodash')
var express = require('express')
var getAttachmentFuncFactory = require('./get-attachment')
var bodyParser = require('body-parser').json()
var ArgumentException = require('./exceptions').ArgumentException

module.exports = function (options) {
  return function (callback, dependencies) {
    var getAttachment = dependencies && dependencies.getAttachment
      ? dependencies.getAttachment
      : getAttachmentFuncFactory(options)

    if (!callback) {
      throw new ArgumentException('callback', 'missing required argument')
    }
    if (typeof callback !== 'function') {
      throw new ArgumentException(
        'callback', 'the 1st argument should be a callback function')
    }

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
        callback(mail)
        res.status(200).send('OK')
      } else {
        res.status(401).send('validation token mismatch')
      }
    })

    return router
  }
}
