const express = require('express'),
      bodyParser = require('body-parser'),
      massive = require('massive'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      FacebookStrategy = require('passport-facebook').Strategy,
      config = require('./config.js'),
      cors = require('cors'),
      jwt = require('jsonwebtoken'),
      cookieParser = require('cookie-parser'),
      session = require('express-session'),
      users = {};

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: config.secret,
  saveUninitialized: false,
  resave: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('./public'));



/////////////
// DATABASE //
/////////////
const massiveInstance = massive.connectSync({connectionString: 'postgres://localhost/sandbox'})

app.set('db', massiveInstance);
const db = app.get('db');

/**
 * Local Auth
 */
passport.use('local', new LocalStrategy(
  function(username, password, done) {
    db.users.findOne({username: username}, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != password) { return done(null, false); }
      return done(null, user);
    })
  }
))

passport.use('facebook', new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'displayName']
},
function(accessToken, refreshToken, profile, done) {
  db.getUserByFacebookId([profile.id], function(err, user) {
    user = user[0];
    if (!user) {
      console.log('CREATING USER');
      db.createUserFacebook([profile.displayName, profile.id], function(err, user) {
        return done(err, user, {scope: 'all'});
      })
    } else {
      return done(err, user);
    }
  })
}));

passport.serializeUser(function(user, done) {
  return done(null, user);
})

passport.deserializeUser(function(user, done) {
  return done(null, user);
})


app.post('/auth/local', passport.authenticate('local'), function(req, res) {
  res.status(200).redirect('/#/');
});


app.get('/auth/me', function(req, res) {
  if (req.user) {
    console.log(req.user);
    res.status(200).send(req.user);
  } else {
    console.log('NO user!')
    res.status(200).send();
  }
})

app.get('/auth/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})

app.listen(3000, function() {
  console.log('Connected on 3000')
})


app.get('/auth/facebook', passport.authenticate('facebook'))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {session: false}), function(req, res) {
    res.status(200).redirect('/#/');
  })