const express = require("express");

const authenticated = require("#middlewares/authenticated");
const authController = require("./controller");

const router = express.Router();

router.get("/signup", authController.renderSignUpForm);

router.get(
  "/signin",
  authenticated.redirect("/"),
  authController.renderSignInForm,
);

router.get("/signout", authController.signOut);

router.post(
  "/signin",
  authController.validateSignInCredentials,
  authController.authenticateSignInCredentials,
);

router.post(
  "/signup",
  authController.validateSignUpCredentials,
  authController.authenticateSignUpCredentials,
);

module.exports = router;
