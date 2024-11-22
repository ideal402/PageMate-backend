const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser);
router.put("/profile", authController.authenticate, userController.uploadProfilePhoto);
router.delete("/", authController.authenticate, userController.deleteUser);
module.exports = router;
