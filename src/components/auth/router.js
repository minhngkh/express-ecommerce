const express = require("express");
const router = express.Router();
const authController = require("./controller");
const authenticated = require("../../middleware/authenticated");

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
