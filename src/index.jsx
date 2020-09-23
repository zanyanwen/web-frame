import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './index.less';
import './utils/config-axios';
import configRem from './utils/config-rem';
import './utils/fix-issues';

if (process.env.ENV !== 'prod' && window.cordova) {
  const vConsole = require('vconsole');
  new vConsole();
}

const root = document.getElementById('app-root') || document.createElement('div');
if (!root.parentNode) document.body.appendChild(root);

configRem();

render(<App />, root);
