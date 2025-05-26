const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehicle.controller.js");

router.get("/api/v2/vehicles", controller.index);
router.post("/api/v2/delete",controller.deleteVehicle);
router.post("/api/v2/create",controller.createVehicle);
module.exports = router