#!/usr/bin/env node

/**
 * Module dependencies
 */
var tradedoubler = require('./')
  , nomnom = require('nomnom');

var opts = nomnom
  .script('tradedoubler-lookup')
  .nocolors()
  .option('id', {
    abbr: 'i',
    required: true,
    help: 'Tradedoubler api token'
  })
  .option('keywords', {
    abbr: 'k',
    required: 'true',
    help: 'Keywords to query with'
  })
  .option('feed', {
    abbr: 'f',
    help: 'Feed ids'
  })
  .option('one', {
    abbr: '1',
    help: 'Limit to one result',
    flag: true,
    default: false
  })
  .option('limit', {
    abbr: 'l',
    help: 'Limit results'
  })
  .option('page', {
    abbr: 'p',
    help: 'Results page'
  })
  .option('price', {
    abbr: 'c',
    help: 'Price range'
  })
  .parse();

tradedoubler({keywords: opts.keywords})
  .id(opts.id)
  .feed(opts.feed)
  .one(opts.one)
  .limit(opts.limit)
  .page(opts.page)
  .price(opts.price)
  .done(function (err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
  });
