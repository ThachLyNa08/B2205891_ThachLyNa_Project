const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Lấy từ Google Cloud Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Kiểm tra user đã tồn tại chưa (theo googleId hoặc email)
      let user = await User.findOne({ 
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] 
      });

      if (user) {
        // Nếu user đã có nhưng chưa có googleId (đk bằng email trước đó), cập nhật thêm
        if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }
        return done(null, user);
      }

      // 2. Nếu chưa có, tạo user mới
      const newUser = new User({
        username: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0].value,
        role: 'reader', // Mặc định là độc giả
        password: '' // Không cần pass
      });

      await newUser.save();
      done(null, newUser);

    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport;