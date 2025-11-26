const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// AI routes
router.post("/summarize", aiController.summarizeNotes);

module.exports = router;

