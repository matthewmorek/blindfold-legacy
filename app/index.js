/*!
 * Node.js Server Script
 */

const express = require('express');
const config = require('./config');
const router = require('./router');

if (config.env === 'development') {
  var bs = require('browser-sync');
}

let app = express();

router.init(app, config);

app.listen(config.port, function() {
  if (config.env === 'development') {
    bs.init({
      proxy: config.site_host + ':' + config.port,
      port: 4000,
      files: ['public/**/*.{js,css}', 'views/**/*.vue'],
      reloadOnRestart: true,
      open: false
    });
  } else {
    console.log('Listening on http://' + config.bind_host + ':' + config.port);
  }
});
