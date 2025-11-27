const express = require("express");
const jwt = require("jsonwebtoken");
const Note = require("../models/Note");

const router = express.Router();

const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

router.get("/", async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { q, subject, tag, sort } = req.query;

    const query = { userId };

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      query.$or = [{ title: regex }, { content: regex }];
    }

    if (subject) {
      query.subject = subject;
    }

    if (tag) {
      query.tags = tag;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "createdAt_asc") sortOption = { createdAt: 1 };
    if (sort === "title_asc") sortOption = { title: 1 };
    if (sort === "title_desc") sortOption = { title: -1 };

    const notes = await Note.find(query).sort(sortOption);
    res.json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: err.message || "Failed to fetch notes" });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, content, subject, tags } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const note = new Note({
      userId,
      title: title.trim(),
      content: content.trim(),
      subject: subject ? subject.trim() : undefined,
      tags: Array.isArray(tags)
        ? tags.map((t) => String(t).trim()).filter(Boolean)
        : undefined,
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ message: err.message || "Failed to create note" });
  }
});

module.exports = router;
