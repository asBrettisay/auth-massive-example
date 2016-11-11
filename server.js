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
      users = {};

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use(express.static('./public'));



/////////////
// DATABASE //
/////////////
const massiveInstance = massive.connectSync({connectionString: 'postgres://localhost/sandbox'})

app.set('db', massiveInstance);
const db = app.get('db');


passport.use(new LocalStrategy(
  function(username, password, done) {
    db.users.findOne({username: username}, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != password) { return done(null, false); }
      return done(null, user);
    })
  }
))


app.post('/auth/local', passport.authenticate('local', {session: false}), function(req, res) {
  const token = jwt.sign(req.user, config.secret)
  res.cookie('my-token', token, {maxAge: 900000})
  res.status(200).redirect('/#/');
});

app.get('/auth/facebook', passport.authenticate('facebook'))


app.get('/auth/me', function(req, res) {
  const token = req.cookies['my-token'];
  console.log(token);
  if (token) {
    const user = jwt.verify(token, config.secret);
    console.log(user);
    res.status(200).send(user);
  } else {
    res.status(200).send();
  }
  
})

app.get('/auth/logout', function(req, res) {
  res.cookie
  res.redirect('/');
})

app.listen(3000, function() {
  console.log('Connected on 3000')
})





passport.use(new FacebookStrategy({
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



app.get('/auth/facebook', passport.authenticate('facebook'))

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {session: false}), function(req, res) {
    const token = jwt.sign(req.user, config.secret)
    res.cookie('my-token', token, {maxAge: 10000})
    res.status(200).redirect('/#/');
  })