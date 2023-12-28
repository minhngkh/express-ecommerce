const express = require("express");

const homeController = require("./controller");

const router = express.Router();

router.get("/", homeController.renderHomepage);

module.exports = router;
