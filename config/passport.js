const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL || 
          "https://capstone-backend-3-jthr.onrender.com/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists by email or googleId
          let user = await User.findOne({ 
            $or: [
              { email: profile.emails[0].value },
              { googleId: profile.id }
            ]
          });

          if (!user) {
            // Create new user
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              password: null, // Google users don't need passwords
              googleId: profile.id,
            });
          } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log("✅ Google OAuth strategy configured");
} else {
  console.warn("⚠️  Google OAuth credentials not found. OAuth routes will not work.");
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
