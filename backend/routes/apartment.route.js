const express = require("express");
const router = express.Router();
const controller = require("../controllers/apartment.controller.js");

router.get("/api/v1/apartments", controller.index);
router.get("/api/v1/remains", controller.getRemain);

module.exports = router;