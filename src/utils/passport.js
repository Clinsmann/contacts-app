const passport = require('passport');
const User = require('../entities/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;
const JWT_SECRET = 'CLINSMANN_AFRICHORAL_WEB_APPLICATION';

/*for authorization*/
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // secretOrKey: process.env.JWT_SECRET
  secretOrKey: JWT_SECRET
}, (payload, done) => {
  User.findById({ _id: payload.sub }, (err, user) => {
    if (err) return done(err, false);
    if (user) return done(null, user);
    else return done(null, false);
  });
}));

/*authenticated local strategy using email and password*/
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email }, (err, user) => {
    /*if something went wrong with the database*/
    if (err) return done(err);
    /*if no user exist*/
    if (!user) return done(null, false);
    /*check if password is correct*/
    user.comparePassword(password, done);
  });
}));
