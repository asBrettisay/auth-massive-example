const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const massive = require('massive')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const LocalStrategy = require('passport-local')
require('dotenv').config()


const app = express();
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

/////////////
// DATABASE //
/////////////
massive({connectionString: 'postgres://localhost/sandbox'}).then(db => {
  app.set('db', db)
})

/**
 * Local Auth
 */
passport.use('local', new LocalStrategy(
  function(username, password, next) {
    db.users.findOne({username: username}, function(err, user) {
      if (err) { return next(err); }
      if (!user) { return next(null, false); }
      if (user.password != password) { return next(null, false); }
      return next(null, user);
    })
  }
))

passport.use('auth0', new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_SECRET,
    callbackURL: '/api/auth/callback'
  }, (accessToken, refreshToken, params, user, done) => {
    // accessToken = Used to make request on behalf of user
    // refreshToken = Get a new accessToken
    // params = extra info the dev requested
    // user = User profile who logged in

    // If I want to save user info to MY database
    // I can do that here
    User.save(user)

    return done(null, user)
  }
))


passport.serializeUser(function(user, done) {
  return done(null, user);
})

passport.deserializeUser(function(user, done) {
  return done(null, user);
})

app.post('/api/auth/local', passport.authenticate('local'), function(req, res) {
  res.status(200).redirect('/');
});

app.get('/api/auth/auth0', passport.authenticate('auth0'), (req, res) => {
  // Going out to AUTH0
  res.redirect('/')
})

app.get('/api/auth/callback', passport.authenticate('auth0'), (req, res) => {
  // Coming back from Auth0
  res.redirect('/')
})

app.get('/api/me', function(req, res) {
  if (req.user) {
    console.log(req.user);
    res.status(200).send(req.user);
  } else {
    console.log('NO user!')
    res.status(200).send('ok');
  }
})

app.get('/api/mydeepestdarkestsecrets', (req, res) => {
  if (req.isAuthenticated) {
    // logged in
  } else {
    // forbidden!!!
  }
})

app.get('/api/auth/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})

app.listen(3000, function() {
  console.log('Connected on 3000')
})
