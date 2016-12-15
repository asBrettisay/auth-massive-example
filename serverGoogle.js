const express = require('express'),
      session = require('express-session'),
      bodyParser = require('body-parser'),
      massive = require('massive'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy,
      GoogleStrategy = require('passport-google-oauth2').Strategy,
      config = require('./config.js'),
      cors = require('cors'),
      cookieParser = require('cookie-parser'),
      jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'keyboardcat'
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

// db.create_user(function(err, user) {
//   if (err) console.log(err);
//   else console.log('CREATED USER');
//   console.log(user);
// })



passport.use(new GoogleStrategy({
  clientID: config.google.clientID,
  clientSecret: config.google.clientSecret,
  callbackURL: "http://localhost:3000/auth/google/callback",
  profileFields: ['id', 'displayName']
},
function(accessToken, refreshToken, profile, cb) {
  db.getUserBygoogleId([profile.id], function(err, user) {
    user = user[0];
    if (!user) {
      console.log('CREATING USER');
      db.createUserGoogle([profile.displayName, profile.id], function(err, user) {
        console.log('USER CREATED', user);
        return cb(err, user);
      })
    } else {
      return cb(err, user);
    }
  })
}));

passport.serializeUser(function(user, done) {
  done(null, user.userid);
})

passport.deserializeUser(function(id, done) {
  db.getUserById([id], function(err, user) {
    user = user[0];
    if (err) console.log(err);
    else console.log('RETRIEVED USER');
    console.log(user);
    done(null, user);
  })
})


app.get('/auth/google', passport.authenticate('google', {session:false}, (req, res) => {
    const token = jwt.sign()
}))

app.get('/auth/google/callback',
  passport.authenticate('google', {successRedirect: '/' }), function(req, res) {
    res.status(200).send(req.user);
  })

app.get('/auth/me', function(req, res) {
  if (!req.user) return res.sendStatus(404);
  res.status(200).send(req.user);
})

app.get('/auth/logout', function(req, res) {
  req.logout();
  res.redirect('/');
})

app.listen(3000, function() {
  console.log('Connected on 3000')
})
