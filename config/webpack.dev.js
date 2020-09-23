const express = require('express');
const constants = require('./constants');

const devConfig = entryName => ({
  mode: 'development',
  watch: true,
  output: {
    publicPath: `/${entryName}`
  },
  devServer: {
    open: true,
    openPage: `${entryName}/`,
    host: constants.devHost,
    port: constants.devPort,
    proxy: constants.devProxy,
    before(app) {
      app.use(`/${entryName}/`, express.static(constants.publicDir));
    }
  },
  devtool: 'cheap-module-source-map',
});

module.exports = devConfig;
