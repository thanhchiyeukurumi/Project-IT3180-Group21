const express = require("express");
const controller = require("../controllers/authen.js");

const router = express.Router();
router.get("/api/v1/profile", controller.getProfile);
router.post("/api/v1/login", controller.signIn);
router.post("/api/v1/changePassword", controller.changePassword);
router.post("/api/v1/edit", controller.editProfile);
router.post("/api/v1/signup", controller.signUp);
module.exports = router;