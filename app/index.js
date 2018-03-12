/*!
 * Node.js Server Script
 */

const express = require('express');
const config = require('./config');
const router = require('./router');

if (config.env !== 'production') {
  var bs = require('browser-sync');
}

let app = express();

router.init(app, config);

app.listen(config.port, function () {
  if (config.env !== 'production') {
    bs.init({
      proxy: 'localhost:' + config.port,
      port: 4000,
      files: [
        'public/**/*.{js,css}',
        'views/**/*.njk'
      ],
      reloadOnRestart: true,
      open: false
    });
    // console.log('Listening on http://localhost:' + config.server.port);
  }
});
