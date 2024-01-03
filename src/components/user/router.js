const express = require("express");

const authenticated = require("#middlewares/authenticated");
const userController = require("./controller");

const router = express.Router();

router.use(authenticated.require);

router.get(
  "/profile",
  authenticated.updateUserInfoInSession(["fullName"]),
  userController.renderProfile,
);

module.exports = router;
