const path = require('path');
const os = require('os');
const app = require('../package.json');


const env = process.env.ENV || 'dev';
const nodeEnv = process.env.NODE_ENV || 'development';
const cwd = process.cwd();
const platform = os.platform();
const appRoot = cwd;
const appDir = path.join(cwd, 'src');
const outDir = path.join(cwd, process.env.OUT_DIR || 'dist');
const publicDir = path.join(cwd, 'public');
const devHost = process.env.HOST || app.host || platform === 'win32' ? 'localhost' : '0.0.0.0';
const devPort = parseInt(process.env.PROT, 10) || parseInt(app.port, 10) || 8080;
const devProxy = app.proxy || {};
const name = app.name;
const author = app.author;
const version = app.version;
const theme = app.theme || null;

module.exports = {
  name,
  author,
  version,
  theme,
  cwd,
  env,
  nodeEnv,
  platform,
  appRoot,
  appDir,
  outDir,
  publicDir,
  devHost,
  devPort,
  devProxy,
};
