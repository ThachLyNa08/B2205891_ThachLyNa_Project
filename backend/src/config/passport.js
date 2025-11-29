const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ 
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] 
      });

      if (user) {
        if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }
        return done(null, user);
      }

      const newUser = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0].value,
        role: 'reader', 
        password: '' 
      });

      await newUser.save();
      done(null, newUser);

    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport;