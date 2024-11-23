const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router.get("/search", bookController.searchBooks);
router.get("/bestsellers", bookController.getBestSellers);

module.exports = router;