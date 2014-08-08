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
    required: true
  })
  .option('keywords', {
    abbr: 'k',
    required: 'true'
  })
  .parse();

tradedoubler({keywords: opts.keywords})
  .id(opts.id)
  .done(function (err, res) {
    if (err) throw err;
    console.log(JSON.stringify(res));
  });
