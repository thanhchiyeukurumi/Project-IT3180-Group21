const express = require("express");
const router = express.Router();
const controller = require("../controllers/fee.controller.js");
const checkApiKey = require("../middlewares/checkAIPkey.js");
router.get("/api/v1/fees", controller.index);
router.post("/api/v1/post",controller.addFee);
router.post("/api/v1/change",controller.changeFee);
router.post("/api/v1/delete",controller.deleteFee);
module.exports = router;