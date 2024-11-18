const express = require("express");
const router = express.Router();
const userApi = require("./user.api");
const authApi = require("./auth.api");
const gptApi = require("./gpt.api");

router.use("/user", userApi);
router.use("/auth", authApi);
router.use("/gpt", gptApi);

module.exports = router;
