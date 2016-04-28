var express = require('express')
var bodyParser = require('body-parser').json()
var ArgumentException = require('./exceptions').ArgumentException

module.exports = function (options) {
  return function (callback) {
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
        res.send(req.query['challenge'])
      } else {
        res.status(401).send('validation token mismatch')
      }
    })

    // POST requests are receiving emails
    router.post('/', bodyParser, function (req, res, next) {
      if (req.get('authorization') === options.validationToken) {
        var mail = req.body
        callback(mail)
      } else {
        res.status(401).send('validation token mismatch')
      }
    })

    return router
  }
}
