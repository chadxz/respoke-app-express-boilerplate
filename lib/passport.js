'use strict';
var config = require('config');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GithubStrategy = require('passport-github').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var googleConfig = config.get('google');
var twitterConfig = config.get('twitter');
var githubConfig = config.get('github');

function configureLocalStrategy(passport, UsersRepository) {
  passport.use(new LocalStrategy({ usernameField: 'email' }, function (email, password, done) {
    email = email.toLowerCase();
    UsersRepository.findOneByEmail(email, function (err, user) {
      if (err) {
        done(err);
        return;
      }

      if (!user) {
        done(null, false, { message: 'Email ' + email + ' not found' });
        return;
      }

      user.comparePassword(password, function (err, isMatch) {
        if (!isMatch) {
          done(null, false, { message: 'Invalid email or password.' });
          return;
        }

        done(null, user);
      });
    });
  }));
}

function configureGoogleStrategy(passport, Users) {
  var googleStrategyConfig = {
    clientID: googleConfig.clientID,
    clientSecret: googleConfig.clientSecret,
    passReqToCallback: true,
    callbackURL: '/auth/google/callback'
  };

  passport.use(new GoogleStrategy(googleStrategyConfig, function (req, accessToken, refreshToken, profile, done) {
    if (req.user) {
      // logged in. try to link to logged in user.
      Users.findOneByProfileId('google', profile.id, function (err, linkedUser) {
        if (err) {
          done(err);
          return;
        }

        if (linkedUser) {
          req.flash('errors', { msg: 'There is already an account linked to this Google profile. Sign in with that account or delete it, then link it with your current account.' });
          done();
          return;
        }

        var user = req.user;
        var picture = profile.photos[0] && profile.photos[0].value;
        var email = profile.emails[0] && profile.emails[0].value;
        user.google = { id: profile.id, accessToken: accessToken, picture: picture };
        user.picture = user.picture || picture;
        user.email = user.email || email;
        user.save(function (err) {
          if (err) {
            done(err);
            return;
          }

          req.flash('info', { msg: 'Github account has been linked.' });
          done(null, user);
        });
      });
      return;
    }

    // not logged in. try to create a new user with the profile.
    Users.findOneByProfileId('google', profile.id, function (err, existingUser) {
      if (err) {
        done(err);
        return;
      }

      if (existingUser) {
        done(null, existingUser);
        return;
      }

      var picture = profile.photos[0] && profile.photos[0].value;
      var email = profile.emails[0] && profile.emails[0].value;
      Users.findOneByEmail(email, function (err, existingEmailUser) {
        if (err) {
          done(err);
          return;
        }

        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' });
          done(err);
          return;
        }

        var user = {
          email: email,
          name: profile.displayName,
          picture: picture,
          google: { id: profile.id, accessToken: accessToken, picture: picture }
        };

        Users.create(user, done);
      });
    });
  }));
}

function configureGithubStrategy(passport, Users) {
  var githubStrategyConfig = {
    clientID: githubConfig.clientID,
    clientSecret: githubConfig.clientSecret,
    passReqToCallback: true,
    callbackURL: '/auth/github/callback'
  };

  passport.use(new GithubStrategy(githubStrategyConfig, function (req, accessToken, refreshToken, profile, done) {
    if (req.user) {
      // logged in. try to link to logged in user.
      Users.findOneByProfileId('github', profile.id, function (err, linkedUser) {
        if (err) {
          done(err);
          return;
        }

        if (linkedUser) {
          req.flash('errors', { msg: 'There is already an account linked to this Github profile. Sign in with that account or delete it, then link it with your current account.' });
          done();
          return;
        }

        var user = req.user;
        user.github = { id: profile.id, accessToken: accessToken, picture: profile._json.avatar_url };
        user.picture = user.picture || profile._json.avatar_url;
        user.email = user.email || profile._json.email;
        user.save(function (err) {
          if (err) {
            done(err);
            return;
          }

          req.flash('info', { msg: 'Github account has been linked.' });
          done(null, user);
        });
      });
      return;
    }

    // not logged in. try to create a new user with the profile.
    Users.findOneByProfileId('github', profile.id, function (err, existingUser) {
      if (err) {
        done(err);
        return;
      }

      if (existingUser) {
        done(null, existingUser);
        return;
      }

      Users.findOneByEmail(profile._json.email, function (err, existingEmailUser) {
        if (err) {
          done(err);
          return;
        }

        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.' });
          done(err);
          return;
        }

        var user = {
          email: profile._json.email,
          name: profile.displayName,
          picture: profile._json.avatar_url,
          github: { id: profile.id, accessToken: accessToken, picture: profile._json.avatar_url }
        };

        Users.create(user, done);
      });
    });
  }));
}

function configureTwitterStrategy(passport, Users) {
  var twitterStrategyConfig = {
    consumerKey: twitterConfig.consumerKey,
    consumerSecret: twitterConfig.consumerSecret,
    passReqToCallback: true,
    callbackURL: '/auth/twitter/callback'
  };

  passport.use(new TwitterStrategy(twitterStrategyConfig, function (req, accessToken, tokenSecret, profile, done) {
    if (req.user) {
      // logged in. try to link to logged in user.
      Users.findOneByProfileId('twitter', profile.id, function (err, linkedUser) {
        if (err) {
          done(err);
          return;
        }

        if (linkedUser) {
          req.flash('errors', { msg: 'There is already an account linked to this Twitter profile. Sign in with that account or delete it, then link it with your current account.' });
          done();
          return;
        }

        var user = req.user;
        user.twitter = { id: profile.id, accessToken: accessToken, tokenSecret: tokenSecret, picture: profile._json.profile_image_url_https };
        user.picture = user.picture || profile._json.profile_image_url_https;
        user.save(function (err) {
          if (err) {
            done(err);
            return;
          }

          req.flash('info', { msg: 'Twitter account has been linked.' });
          done(null, user);
        });
      });
      return;
    }

    // not logged in. try to create a new user with the profile.
    Users.findOneByProfileId('twitter', profile.id, function (err, existingUser) {
      if (err) {
        done(err);
        return;
      }

      if (existingUser) {
        done(null, existingUser);
        return;
      }

      var user = {
        name: profile.displayName,
        picture: profile._json.profile_image_url_https,
        twitter: { id: profile.id, accessToken: accessToken, tokenSecret: tokenSecret, picture: profile._json.profile_image_url_https }
      };

      Users.create(user, done);
    });
  }));
}

/**
 * Configure serialization and authorization strategies on the passed instance of passport
 *
 * @param {object} passport The instance of passport to configure
 * @param {object} Users The Users repository
 */
module.exports = function (passport, Users) {

  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    Users.findOneById(id, function (err, user) {
      done(err, user);
    });
  });

  configureLocalStrategy(passport, Users);

  if (googleConfig.enabled) {
    configureGoogleStrategy(passport, Users);
  }

  if (githubConfig.enabled) {
    configureGithubStrategy(passport, Users);
  }

  if (twitterConfig.enabled) {
    configureTwitterStrategy(passport, Users);
  }
};
