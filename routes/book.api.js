const express = require("express");
const router = express.Router();
const { searchBooks } = require("../controllers/bookController");

router.get("/search", searchBooks);

module.exports = router;