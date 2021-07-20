const express = require("express");
const testRouteController = require("../controllers/testRouteController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.protect, testRouteController.testRoute);

router.get("/admin", authController.protect, authController.restrictTo('admin'),testRouteController.testRouteSadmin);

module.exports = router;
