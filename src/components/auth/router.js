const express = require("express");

const authenticated = require("#middlewares/authenticated");
const authController = require("./controller");

const router = express.Router();

router.get(
  "/signup",
  authenticated.redirect(),
  authController.renderSignUpForm,
);

router.get(
  "/signin",
  authenticated.redirect(),
  authController.renderSignInForm,
);

router.get("/signout", authController.signOut);

router.post(
  "/signin",
  authController.validateSignInCredentials,
  authController.authenticateSignInCredentials,
  authController.redirectOnSuccess,
);

router.post(
  "/signup",
  authController.validateSignUpCredentials,
  authController.authenticateSignUpCredentials,
  authController.redirectOnSuccess,
);

module.exports = router;
