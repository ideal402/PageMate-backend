const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authController = require("../controllers/authController");

router.post("/write", authController.authenticate, commentController.addComment);

module.exports = router;