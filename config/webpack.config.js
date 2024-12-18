'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = merge(common, {
  entry: {
    background: PATHS.src + '/background.js',
    contentScript: PATHS.src + '/contentScript.js',
    pageScript: PATHS.src + '/pageScript.js'
  },
});

module.exports = config;
