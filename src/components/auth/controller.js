const { body } = require("express-validator");

const passport = require("#middlewares/passport");
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
    res.redirect(req.query.next || "/");
  });
};

exports.validateSignInCredentials = [
  body("email").isEmail().withMessage("Invalid email address"),
  body("password").isLength({ min: 7, max: 100 }),
];

exports.authenticateSignInCredentials = passport.authenticate("local", {
  failureRedirect: "back",
});

exports.redirectOnSuccess = (req, res, _) => {
  res.redirect(req.query.next || "/");
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
