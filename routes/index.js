const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const postApi = require("./post.api");
const gptApi = require("./gpt.api");
const bookApi = require("./book.api");
const commentApi = require("./comment.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/post", postApi);
router.use("/gpt", gptApi);
router.use("/book", bookApi);
router.use("/comment", commentApi);

module.exports = router;
