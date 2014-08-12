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

Tradedoubler.prototype.feed = function (feed) {
  return this._feed = feed, this;
};

Tradedoubler.prototype.limit = function (limit) {
  if (!limit) return this;
  return this._limit = limit, this;
};

Tradedoubler.prototype.one = function (one) {
  one = ('undefined' === typeof one) ? true : !!one;
  return this._one = one, this;
};

Tradedoubler.prototype.page = function (page) {
  return this._page = page, this;
};

Tradedoubler.prototype.done = function (cb) {
  var one = this._one
    , limit = one ? 1 : this._limit
    , page = this._page;

  return request
    .get(endpoint)
    .query({token: this._id})
    .query({fid: this._feed})
    .query({q: this._keywords})
    .query({pageSize: limit})
    .query({limit: limit * page + limit})
    .query({page: page})
    .end(function (err, res) {
      // HTTP errors
      if (err) return cb(err);

      // Text errors
      if (res.type === 'text/plain') return cb(new Error(res.text));

      // API errors
      if (err = formatErrors(res.body.errors)) return cb(err);

      // Format results
      var result = format(res.body.products);

      // Limit
      if (one) {
        result = _.first(result) || null;
      } else if (limit) {
        result = _.first(result, limit);
      }

      return cb(null, result);
    });
};

var formatErrors = function (errors) {
  var first = _.first(errors);

  if (!first) return null;

  return new Error(first.message);
};

var format = function (products) {
  return products.map(function (p) {
    var offer = formatOffers(p.offers)
      , name = p.name;

    if (!offer || !name) return null;

    return _.extend(offer, {
      name: name
    });
  })
  .filter(function (p) {
    return p !== null;
  });
};

var formatOffers = function (offers) {
  var first = _.first(offers)
    , price = formatPrices(first.priceHistory);

  if (!first || !price) return null;

  return _.extend(price, {
    url: first.productUrl,
    id: first.id
  })
};

var formatPrices = function (prices) {
  var first = _.first(prices);

  if (!first) return null;

  return {
    listPrice: first.price.value,
    currency: first.price.currency
  }
};
