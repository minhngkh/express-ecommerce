const express = require("express");
const router = express.Router();
const homeController = require("./controller");

router.get("/", homeController.renderHomepage);

module.exports = router;
