const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

router.post("/write", authController.authenticate, postController.createPost);
router.get('/', postController.getPosts);
router.get("/me", authController.authenticate, postController.getMyPosts);
router.get("/liked", authController.authenticate, postController.getLikedPosts);

module.exports = router;