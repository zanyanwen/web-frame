const express = require('express');
const proxy = require('http-proxy-middleware');
const pkg = require('./package.json');
const constants = require('./config/constants');

const app = express();

Object.keys(pkg.proxy || {}).map(path => {
  const setting = pkg.proxy[path];
  if ({}.toString.call(setting.pathRewrite) === '[object Object]') {
    Object.keys(setting.pathRewrite).forEach(key => {
      const rewrite = setting.pathRewrite[key];
      delete setting.pathRewrite[key];
      const newKey = key.replace(/\/api/, '');
      if (newKey === '^') return;
      setting.pathRewrite[newKey] = rewrite;
    })
  }
  app.use(path.replace(/^\/api/, ''), proxy(setting))
});

app.listen(constants.devPort + 1, '0.0.0.0');
