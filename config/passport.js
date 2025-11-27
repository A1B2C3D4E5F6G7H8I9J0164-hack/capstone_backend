const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails[0]?.value;
        if (!googleEmail) {
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await User.findOne({
          $or: [
            { email: googleEmail },
            { googleId: profile.id }
          ]
        });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: googleEmail,
            googleId: profile.id
          });
        } else {
          if (user.email !== googleEmail) {
            user.email = googleEmail;
          }
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          if (user.name !== profile.displayName) {
            user.name = profile.displayName;
          }
          await user.save();
        }

        return done(null, user);

      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
