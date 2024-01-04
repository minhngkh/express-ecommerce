const crypto = require("crypto");
const { body, param, validationResult } = require("express-validator");
const createError = require("http-errors");

const emailSender = require("#lib/emailSender");
const cartService = require("#components/cart/service");
const passport = require("#middlewares/passport");
const { trimUrl } = require("#utils/formatter");
const authService = require("./service");

//TODO: Check validation errors

exports.renderSignUpForm = (req, res, _) => {
  let msg = null;
  if (req.session.messages && req.session.messages.length) {
    msg = req.session.messages[0];
    req.session.messages = null;
  }
  res.render("auth/signup", {
    title: "Sign up",
    toast: msg ? [msg, { type: "danger" }] : null,
  });
};

exports.renderSignInForm = (req, res, _) => {
  let msg = null;
  if (req.session.messages && req.session.messages.length) {
    msg = req.session.messages[0];
    req.session.messages = null;

    if (msg === "Account has not been verified") {
      const { id, email } = req.session.unverifiedUser;
      return res.render("auth/verify", {
        title: "Account verification",
        msg: "Your account has not been verified. Please open the verification link sent to your email.",
        hasResendButton: true,

        id: id,
        email: email,
      });
    }
  }

  res.render("auth/signin", {
    title: "Sign in",
    toast: msg ? [msg, { type: "danger" }] : null,
  });
};

exports.signOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect(trimUrl(req.query.next) || "/");
  });
};

exports.validateSignInCredentials = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 7, max: 100 }),
];

exports.authenticateSignInCredentials = passport.authenticate("local", {
  failureRedirect: "back",
  failureMessage: true,
});

exports.processOnSuccess = async (req, res, next) => {
  const { id: userId } = req.user;
  const userCartId = await cartService.getCartOfUser(userId);
  const { sessionCartId } = res.locals;

  try {
    if (userCartId) {
      if (sessionCartId) {
        await cartService.mergeCart(sessionCartId, userCartId);
        console.log("Cart merged");
      }
      req.session.cartId = userCartId;
    } else if (sessionCartId) {
      await cartService.bindCartToUser(sessionCartId, userId);
      req.session.cartId = sessionCartId;
      console.log("Cart bound");
    }
  } catch (err) {
    return next(err);
  }
  if (res.locals.doNotRedirect) {
    return next();
  }
  res.redirect(trimUrl(req.query.next) || "/");
};

exports.validateSignUpCredentials = [
  body("name").notEmpty().withMessage("Full name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 7, max: 100 })
    .withMessage("Password must be between 7 and 100 characters"),
  body("passwordConfirmation")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords confirmation does not match"),
];

exports.authenticateSignUpCredentials = async (req, res, next) => {
  const userExists = await authService.existsUser(req.body.email);

  // Existing email
  if (userExists) {
    return res.redirect("back");
  }

  try {
    const { name, email, password } = req.body;
    const id = await authService.createUser({
      name: name,
      email: email,
      password: password,
    });

    res.locals.unverifiedUser = {
      id: id,
      email: email,
    };

    next();
  } catch (err) {
    next(err);
  }
};

exports.retainSessionInfo = (req, res, next) => {
  res.locals.sessionCartId = req.session.cartId;
  next();
};

exports.sendVerificationEmail = async (req, res, next) => {
  const { id, email } = res.locals.unverifiedUser;

  try {
    const token = crypto.randomBytes(64).toString("hex");
    await authService.updateStatus(id, { token: token });

    let baseUrl;
    if (process.env.NODE_ENV === "production") {
      baseUrl = `${req.protocol}://${req.hostname}`;
    } else {
      baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    }

    await emailSender.send(email, "Verify email", "verifyEmail", {
      baseUrl: baseUrl,
      id: id,
      token: token,
      email: email,
    });

    res.render("auth/verify", {
      title: "Account verification",
      msg: `A verification link has been sent to ${email}`,
      hasResendButton: true,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyToken = [
  param("id").notEmpty().isInt({ min: 0 }),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(createError(400));

    const userId = Number(req.params.id);
    const token = req.params.token;

    const trueToken = await authService.getTokenById(userId);

    if (trueToken === null || trueToken.value === null) {
      return next(createError(400));
    }
    if (
      trueToken.value !== token ||
      new Date(trueToken.expiration) < new Date()
    ) {
      return res.render("auth/verify", {
        title: "Account verification",
        msg: "Your account verification link is expired",
        hasResendButton: true,
      });
    }

    await authService.updateStatus(userId, { isVerified: true, token: null });

    req.login(
      {
        id: userId,
        email: trueToken.ofEmail,
      },
      (err) => {
        if (err) {
          return next(err);
        }
      },
    );

    res.locals.doNotRedirect = true;
    next();
  },
];

exports.renderVerificationMessage = (req, res, _) => {
  res.render("auth/verify", {
    title: "Account verification",
    msg: "Your account has been verified",
  });
};

// exports.renderForgotPasswordForm = (req, res, _) => {
//   res.render("resetPassword", { title: "Forgot password" });
// };

// exports.validateSignUpCredentials = [
//   body("email").isEmail().withMessage("Invalid email address"),
//   body("password")
//     .isLength({ min: 7, max: 100 })
//     .withMessage("Password must be between 7 and 100 characters"),
//   body("confirm-password").custom((value, { req }) => {
//     if (value !== req.body.password) {
//       // Handle error page
//     }
//     return true;
//   }),
// ];

// exports.sendResetPasswordEmail = async (req, res, next) => {
//   const token = crypto.randomBytes(64).toString("hex");
//   const email = req.body.email;
//   const password = req.body.password;

//   try {
//     await sendEmail(email, "Reset password", "resetPasswordEmail", {
//       token,
//       password,
//       email,
//     });
//   } catch (err) {
//     next(err);
//   }
//   redirect("back");
// };

// exports.verifyPasswordResetToken = (req, res, next) => {
//   const { email, password, token } = req.params;
//   userService.changePassword(email, password).then((val) => {
//     if (val) {
//       res.send("Password changed");
//     } else {
//       res.send("Database error");
//     }
//   });
// };
