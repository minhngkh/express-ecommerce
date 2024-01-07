const bcrypt = require("bcrypt");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const usersServices = require("#components/user/service");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, cb) => {
      const account = {
        email: email,
      };

      const result = await usersServices.getUserInfoFromEmail(email, [
        "id",
        "password",
        "isVerified",
        "isBanned",
      ]);

      if (!result)
        return cb(null, false, { message: "Incorrect email or password" });
      if (!result.isVerified) {
        req.session.unverifiedUser = {
          id: result.id,
          email: email,
        };
        return cb(null, false, { message: "Account has not been verified" });
      }
      if (result.isBanned)
        return cb(null, false, { message: "Account has been banned" });

      Object.assign(account, result);

      bcrypt.compare(password, account.password, (err, result) => {
        if (err) {
          return cb(err);
        }

        if (!result) {
          return cb(null, false, { message: "Incorrect email or password" });
        }

        return cb(null, account);
      });
    },
  ),
);

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, email: user.email });
  });
});

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

module.exports = passport;
