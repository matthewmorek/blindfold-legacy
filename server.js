/*!
 * Node.js Server Script
 */
/* eslint no-multi-spaces: 0 */
const path      = require('path');
var config      = require('config');
var express     = require('express');
if (process.env.NODE_ENV !== 'production') {
  var bs = require('browser-sync');
}
var helmet      = require('helmet');
var nunjucks    = require('nunjucks');
var bodyParser  = require('body-parser');
var sanitizer   = require('express-sanitizer');
var logger      = require('morgan');
// var dateformat  = require('dateformat');

// Main app
var app = express();
var _templates = path.join(__dirname, '/views');

nunjucks.configure(_templates, {
  autoescape: true,
  watch: config.get('app.server.watch'),
  cache: config.get('app.server.cache'),
  express: app
});

// Set Nunjucks as rendering engine
app.engine('njk', nunjucks.render);
app.set('view engine', 'njk');
app.set('views', _templates);

app.use(logger('dev'));
app.use(helmet());
app.enable('trust proxy');
app.use(express.static(path.join(__dirname, '/public'), { index: false }));
app.use(bodyParser.json());
app.use(sanitizer());

app.get('/', function (req, res) {
  var context = {};
  // define basic context for the templates
  context.base_url = req.protocol + '://' + req.get('host');
  context.page_url = context.base_url + req.path;
  context.meta = config.get('app.meta');

  // render the request
  res.render('index', context);
});

app.listen(process.env.PORT || config.get('app.server.port'), function () {
  if (process.env.NODE_ENV !== 'production') {
    bs.init({
      proxy: 'localhost:' + (process.env.PORT || config.get('app.server.port')),
      port: 4000,
      files: [
        'public/**/*.{js,css}',
        'views/**/*.njk'
      ],
      reloadOnRestart: true,
      open: false
    });
    console.log('Listening on http://localhost:' + (process.env.PORT || config.get('app.server.port')));
  }
});
