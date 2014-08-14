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

Tradedoubler.prototype.price = function (price) {
  price = ('string' === typeof price) ? price.split('..') : price;

  if (price[0]) this._minPrice = price[0];
  if (price[1]) this._maxPrice = price[1];

  return this;
};

Tradedoubler.prototype.matrix = function () {
  var one = this._one
    , limit = one ? 1 : this._limit
    , page = this._page;

  return _
    .chain({})
    .cextend({fid: this._feed})
    .cextend({q: this._keywords})
    .cextend({pageSize: limit})
    .cextend({limit: limit * page + limit})
    .cextend({page: page})
    .cextend({minPrice: this._minPrice})
    .cextend({maxPrice: this._maxPrice})
    .value();
};

Tradedoubler.prototype.params = function () {
  var matrix = this.matrix();

  return _
    .pairs(matrix)
    .map(function (o) {
      return o[0] + '=' + o[1];
    })
    .join(';');
};

Tradedoubler.prototype.done = function (cb) {
  var one = this._one
    , limit = one ? 1 : this._limit
    , params = this.params();

  return request
    .get(endpoint + (params.length ? ';' + params : ''))
    .query({token: this._id})
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

_.mixin({
  cextend: function (obj) {
    var others = _.toArray(arguments).slice(1);

    _.each(others, function (o) {
      if (o) {
        for (var k in o) {
          if ('undefined' === typeof o[k]) continue;
          obj[k] = o[k];
        }
      }
    });

    return obj;
  }
});
