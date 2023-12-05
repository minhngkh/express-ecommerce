const express = require("express");
const router = express.Router();
const productsController = require("./controller");

router.get("/laptops", productsController.renderLaptopProductsList);

module.exports = router;
