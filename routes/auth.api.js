const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/login/google", authController.loginWithGoogle);
router.post("/login/kakao", authController.loginWithKakao);

module.exports = router;