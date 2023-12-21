const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello from test router");
});

router.get("/user-locals", (req, res) => {
  res.json(res.locals.user);
});

module.exports = router;
