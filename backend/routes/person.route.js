const express = require('express');
const controller = require("../controllers/person.controller");

const router = express.Router();
router.get("/api/v1/all", controller.getPersonAll);
router.get("/api/v1/detail", controller.getPersonDetail);
router.post("/api/v1/create", controller.createPerson);
router.post("/api/v1/edit", controller.editPerson);
router.post("/api/v1/delete", controller.deletePerson);

module.exports = router;