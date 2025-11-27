const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");


router.post("/summarize", aiController.summarizeNotes);
router.post("/quiz", aiController.generateQuizFromNotes);

module.exports = router;

