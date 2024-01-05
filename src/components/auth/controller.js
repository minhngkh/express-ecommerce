const { body } = require("express-validator");

const cartService = require("#components/cart/service");
const passport = require("#middlewares/passport");
const { trimUrl } = require("#utils/formatter");
const userService = require("./service");

//TODO: Check validation errors

exports.renderSignUpForm = (req, res, _) => {
  res.render("auth/signup", { title: "Sign up" });
};

exports.renderSignInForm = (req, res, _) => {
  res.render("auth/signin", { title: "Sign in" });
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
  const userExists = await userService.existsUser(req.body.email);

  // Existing email
  if (userExists) {
    return res.redirect("back");
  }

  try {
    const id = await userService.createUser({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    req.login(
      {
        id: id,
        email: req.body.email,
      },
      (err) => {
        if (err) {
          return next(err);
        }
        next();
      },
    );
  } catch (err) {
    res.redirect("back");
  }
};

exports.retainSessionInfo = (req, res, next) => {
  res.locals.sessionCartId = req.session.cartId;
  next();
};

const sendEmail = require("../../lib/nodemailer.lib");
const crypto = require("crypto");
const { hash } = require("bcrypt");
const { redirect } = require("#middlewares/authenticated");
exports.verifyEmail = async (req, res, next) => {
  const token = crypto.randomBytes(64).toString("hex");
  const email = req.body.email;
  const name = req.body.name;
  const id = 13;  // TODO: get id from where?

  try {
    await sendEmail(email, "Verify email", "verifyEmail", { id, name, token });
  } catch (err) {
    next(err);
  }

  next();
};

exports.tokenVerification = (req, res, next) => {
  const { id, token } = req.params;
  userService.updateToken(id, token).then((val) => {
    if (val) {
      res.send("Token verified");
    } else {
      res.send("Invalid token");
    }
  });  
};

exports.renderForgotPasswordForm = (req, res, _) => {
  res.render("sendResetPassword", { title: "Forgot password" });
};

exports.validateSignUpCredentials = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 7, max: 100 })
    .withMessage("Password must be between 7 and 100 characters"),
  body("confirm-password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        // Handle error page
      }
      return true;
    }),
];

exports.sendResetPasswordEmail = async (req, res, next) => {
  const email = req.body.email;
  const token = await userService.getTokenByEmail(email);
  
  try {
    await sendEmail(email, "Reset password", "resetPasswordEmail", { token });
  } catch (err) {
    next(err);
  }
  redirect("/auth/signin");
};

exports.verifyPasswordResetToken = (req, res, next) => {
  const { token } = req.params;
  // res.send(token);
  res.render("resetPassword", { token });
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const email = await userService.getEmailByToken(token);
  // res.send(email + " " + password);

  if (email) {
    userService.changePassword(email, password);
    res.send("Password changed");
  } else {
    res.send("Invalid token");
  }
};