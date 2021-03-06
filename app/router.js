/*!
 * Node.js Server Script
 */
/* eslint no-multi-spaces: 0 */
const promiseLimit = require('promise-limit');
const express = require('express');
const sanitizer = require('express-sanitizer');
const session = require('cookie-session');
const config = require('./config');
const path = require('path');
const helmet = require('helmet');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cache = require('apicache');
const cacheMiddleware = cache.middleware;
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const Twitter = require('twitter');
const bugsnag = require('bugsnag');

module.exports.init = (app, config) => {
  var _twitter;
  var _limit = promiseLimit(25);
  var _templates = path.join(__dirname, './../views');
  var _session = {
    secret: config.salt
  };

  var isProduction = function () {
    return (config.env === 'production' ? true : false);
  };

  bugsnag.register(config.bs_key);

  nunjucks.configure(_templates, {
    autoescape: true,
    watch: config.server_watch,
    cache: config.server_cache,
    express: app
  });

  passport.use(new TwitterStrategy(
    {
      consumerKey: config.app_key,
      consumerSecret: config.app_secret,
      callbackURL: 'https://' + config.site_host + (config.env !== 'production' ? ':' + config.port : '') + '/auth/callback'
    },
    function (token, tokenSecret, profile, cb) {
      return cb(null, profile, {
        consumer_key: config.app_key,
        consumer_secret: config.app_secret,
        access_token_key: token,
        access_token_secret: tokenSecret
      });
    }
  ));

  passport.serializeUser(function (user, cb) {
    cb(null, user);
  });

  passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
  });

  app.engine('njk', nunjucks.render);
  app.set('view engine', 'njk');
  app.set('views', _templates);

  app.use(bugsnag.requestHandler);
  // app.use(logger('dev'));
  app.use(helmet());
  app.enable('trust proxy', 1);
  app.use(express.static(path.join(__dirname, './../public'), { index: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(sanitizer());
  app.use(session(_session));

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', function (req, res) {
    var context = {};
    // define basic context for the templates
    context.base_url = req.protocol + '://' + req.get('host');
    context.page_url = context.base_url + req.path;
    context.meta = {
      language: 'en',
      locale: 'en_GB',
      author: 'Matthew Morek',
      title: 'Blindfold',
      description: 'Turn off retweets from people you follow, all at once.',
      og_type: 'website',
      og_image: '/images/og-image.png',
      twitter: {
        card: 'summary_large_image',
        creator: 'matthewmorek'
      }
    };
    context.user = req.session.user;

    if (config.gs_app_id) {
      context.gs_app_id = config.gs_app_id;
    }

    if (req.session.auth) {
      _twitter = new Twitter(req.session.auth);
    }

    res.render('index', context);
  });

  // Initiate authentication with Twitter
  app.get('/auth', passport.authenticate('twitter'));

  // Process Twitter callback and verify authentication
  app.get('/auth/callback', function (req, res, next) {
    passport.authenticate('twitter', { session: false }, function (err, user, info, status) {
      if (err) {
        bugsnag.notify(new Error('Problem authenticating with Twitter API'), { errors: err });
        return next(err);
      }
      if (!user) { return res.redirect('/404'); }
      req.session.auth = info;
      req.session.user = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        photo: user.photos[0].value
      };
      res.redirect('/');
    })(req, res, next);
  });

  // Fetch data about friendships from the API
  app.get('/friends', cacheMiddleware('5 minutes', isProduction), function (req, res, next) {
    req.apicacheGroup = 'friends';
    // Define a payload response object
    res.payload = {};
    // Fetch number of retweeters blocked
    _twitter.get('friendships/no_retweets/ids', function (errors, response) {
      if (errors) {
        bugsnag.notify(new Error('Problem getting `no_retweets` ids'), { errors: errors });
        res.json({errors: errors});
      } else {
        var retweetersBlocked = {
          count: response.length,
          ids: response
        };
        res.payload.retweeters_blocked = retweetersBlocked;
        next();
      }
    });
  }, function (req, res, next) {
    // Fetch number of friends (people you follow)
    _twitter.get('friends/ids', { stringify_ids: true }, function (errors, response) {
      if (errors) {
        bugsnag.notify(new Error('Problem getting friends/ids'), { errors: errors });
        res.json({errors: errors});
      } else {
        res.payload.following = response.ids;
        next();
      }
    });
  }, function (req, res) {
    res.json(res.payload);
  });

  app.post('/friends', function (req, res, next) {
    _twitter.get('friends/ids', { stringify_ids: true }).then(function (response) {
      res.following = response.ids;
      next();
    }).catch(function (errors) {
      bugsnag.notify(new Error('Problem getting friends/ids'), { errors: errors });
      res.json({errors: errors});
    });
  }, function (req, res, next) {
    var following = res.following;
    var count = 0;

    Promise.all(following.map(function (id) {
      return _limit(function () {
        return _twitter.post('friendships/update', {
          user_id: id,
          retweets: req.body.want_retweets
        }).then(function (response) {
          count += 1;
        }).catch(function (errors) {
          bugsnag.notify(new Error('Problem with posting and update to Twitter API'), { errors: errors });
          next(errors);
        });
      });
    })).then(function (data) {
      next();
    }).catch(function (errors) {
      bugsnag.notify(new Error(errors));
      res.json({errors: errors});
    });
  }, function (req, res) {
    _twitter.get('friendships/no_retweets/ids', function (errors, response) {
      if (errors) {
        bugsnag.notify(new Error('Problem getting `no_retweets` ids'), { errors: errors });
        res.json({errors: errors});
      } else {
        cache.clear('friends');
        res.json({
          retweeters_blocked: {
            count: response.length,
            ids: response
          }
        });
      }
    });
  });
};
