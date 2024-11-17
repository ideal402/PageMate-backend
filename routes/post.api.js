const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

router.post("/write", authController.authenticate, postController.createPost);

module.exports = router;