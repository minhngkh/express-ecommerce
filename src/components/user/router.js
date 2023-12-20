const express = require("express");
const router = express.Router();
const userController = require("./controller");
const authenticated = require("../../middleware/authenticated");

router.use(authenticated.require);

router.get(
  "/profile",
  authenticated.updateUserInfoInSession(["fullName"]),
  userController.renderProfile,
);

module.exports = router;
