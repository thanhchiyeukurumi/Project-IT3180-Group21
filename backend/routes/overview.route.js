const express = require('express');
const controller = require("../controllers/overview");

const router = express.Router();
router.get("/api/v1/dashboard", controller.getDashboardOverview);

module.exports = router;