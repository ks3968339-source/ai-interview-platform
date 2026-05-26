const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/questions - Fetch all questions, or filter by category in query param
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = {};
    if (category) {
      filter.category = category;
    }

    const questions = await prisma.question.findMany({
      where: filter,
      orderBy: { id: 'asc' }
    });

    res.json(questions);
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/questions/:id - Fetch details of a single question
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid Question ID" });
    }

    const question = await prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    res.json(question);
  } catch (error) {
    console.error("❌ Error fetching question by ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
