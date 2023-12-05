const express = require("express");
const router = express.Router();
const productsController = require("./controller");

router.get("/laptops", productsController.renderLaptopProductsList);

router.get("/laptops/:id", productsController.renderLaptopProductDetail);

router.post("/add-review", productsController.addReview);

module.exports = router;
