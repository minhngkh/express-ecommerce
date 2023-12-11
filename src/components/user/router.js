const express = require("express");
const router = express.Router();
const userController = require("./controller");
const authenticated = require("../../middleware/authenticated");

router.use(authenticated.require);

router.get("/profile", userController.renderProfile);

module.exports = router;
