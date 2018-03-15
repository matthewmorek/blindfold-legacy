/*!
 * Node.js Server Script
 */
/* eslint no-multi-spaces: 0 */
const express = require('express');
const sanitizer = require('express-sanitizer');
const session = require('express-session');
const config = require('./config');
const path = require('path');
const helmet = require('helmet');
const nunjucks = require('nunjucks');
const bodyParser = require('body-parser');
const cookies = require('cookie-parser');
const login = require('connect-ensure-login');
const logger = require('morgan');
const cache = require('apicache').middleware;
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const Twitter = require('twitter');

module.exports.init = (app, config) => {
  var twitter;
  var _templates = path.join(__dirname, './../views');

  nunjucks.configure(_templates, {
    autoescape: true,
    watch: config.server_watch,
    cache: config.server_cache,
    express: app
  });

  passport.use(new TwitterStrategy(
    {
      consumerKey: 'KKI0G62PzImVqbJJTo62DJCrI',
      consumerSecret: 'v7ctyWhI5Kd4SiIoXrDQBXl9dHHnVcsa0JusUKQ2fflcbVXfbT',
      callbackURL: 'http://127.0.0.1:' + config.port + '/auth/callback'
    },
    function (token, tokenSecret, profile, cb) {
      // Define auth details for interacting with Twitter API
      twitter = new Twitter({
        consumer_key: 'KKI0G62PzImVqbJJTo62DJCrI',
        consumer_secret: 'v7ctyWhI5Kd4SiIoXrDQBXl9dHHnVcsa0JusUKQ2fflcbVXfbT',
        access_token_key: token,
        access_token_secret: tokenSecret
      });
      return cb(null, profile);
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

  app.use(logger('dev'));
  app.use(helmet());
  app.enable('trust proxy', 1);
  app.use(express.static(path.join(__dirname, './../public'), { index: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookies());
  app.use(sanitizer());
  app.use(session({ secret: 'fire @jack', resave: true, saveUninitialized: true }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/', function (req, res) {
    var context = {};
    // define basic context for the templates
    context.base_url = req.protocol + '://' + req.get('host');
    context.page_url = context.base_url + req.path;
    context.user = req.user;
    context.meta = {
      language: 'en',
      locale: 'en_GB',
      author: 'Matthew Morek',
      title: 'Blindfold',
      subtitle: 'Disable retweets from people you follow, all at once.',
      description: '',
      og_type: 'website',
      twitter: {
        card: 'summary_large_image',
        creator: 'matthewmorek'
      }
    };

    res.render('index', context);
  });

  // Initiate authentication with Twitter
  app.get('/auth', passport.authenticate('twitter'));

  // Process Twitter callback and verify authentication
  app.get('/auth/callback', passport.authenticate('twitter', { failureRedirect: '/404' }), function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

  app.get('/friends', cache('5 minutes'), function (req, res, next) {
    // Define a payload response object
    res.payload = {};
    // Fetch number of retweeters blocked
    twitter.get('friendships/no_retweets/ids', function (error, response) {
      if (error) {
        res.json(error);
      } else {
        res.payload.retweeters_blocked = {
          count: response.length,
          ids: response
        };
        next();
      }
    });
  }, function (req, res, next) {
    // Fetch number of friends (people you follow)
    twitter.get('friends/ids', { stringify_ids: true }, function (error, response) {
      if (error) {
        res.json(error);
      } else {
        res.payload.following = response.ids;
        next();
      }
    });
  }, function (req, res) {
    res.json(res.payload);
  });

  app.post('/friends', function (req, res, next) {
    twitter.get('friends/ids', { stringify_ids: true }).then(function (response) {
      res.following = response.ids;
      next();
    }).catch(function (error) {
      console.log(error);
    });
  }, function (req, res, next) {
    var following = res.following;

    Promise.all(following.map(function (id) {
      return twitter.post('friendships/update', {
        user_id: id,
        retweets: req.body.want_retweets
      }).then(function (response) {
      }).catch(function (error) {
        console.log(error);
      });
    })).then(function (data) {
      next();
    }).catch(function (error) {
      console.log(error);
    });
  }, function (req, res) {
    twitter.get('friendships/no_retweets/ids', function (error, response) {
      if (error) {
        console.log(response);
      } else {
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
