const express = require("express");
const router = express.Router();
const gptController = require("../controllers/gptController");

router.post("/stylelearning", gptController.styleLearning);
router.post("/stylechange", gptController.styleChange);     
router.post("/contentcorrection", gptController.contentCorrection);
router.post("/spellingcorrection", gptController.spellingCorrection);

module.exports = router;
