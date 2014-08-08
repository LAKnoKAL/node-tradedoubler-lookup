/**
 * Module dependencies
 */
var request = require('superagent')
  , _ = require('underscore');

// API endpoint
var endpoint = 'http://api.tradedoubler.com/1.0/products.json'

var Tradedoubler = module.exports = function Tradedoubler (opts) {
  if (!(this instanceof Tradedoubler)) return new Tradedoubler(opts);

  this._keywords = opts.keywords;
};

Tradedoubler.prototype.id = function (id) {
  return this._id = id, this;
};

Tradedoubler.prototype.done = function (cb) {
  return request
    .get(endpoint)
    .query({token: this._id})
    .end(function (err, res) {
      return cb(err, res.text);
    });
};
