const express = require("express");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const router = express.Router();

router.post("/write", authController.authenticate, postController.createPost);
router.get("/", postController.getPosts);
router.get("/me", postController.getMyPosts);
router.get("/liked", postController.getLikedPosts);
router.put("/:id", authController.authenticate, postController.updatePost);
router.delete("/:id", authController.authenticate, postController.deletePost);
router.post("/:id/like", authController.authenticate, postController.likePost);

module.exports = router;