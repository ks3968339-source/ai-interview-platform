const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { evaluateAnswer } = require('../services/ai.service');

// POST /api/answers - Submit an interview response for evaluation
router.post('/', async (req, res) => {
  try {
    const { userId, questionId, userAnswerText } = req.body;

    // 1. Parameter Validation
    if (!userId || !questionId || userAnswerText === undefined) {
      return res.status(400).json({ error: "Missing required fields: userId, questionId, and userAnswerText are required." });
    }

    if (userAnswerText.trim().length === 0) {
      return res.status(400).json({ error: "Answer text cannot be blank." });
    }

    // 2. Fetch the question to get text and category
    const question = await prisma.question.findUnique({
      where: { id: parseInt(questionId) }
    });

    if (!question) {
      return res.status(404).json({ error: "Interview question not found." });
    }

    // 3. Trigger the AI evaluation service
    console.log(`🤖 Evaluating answer for Question ID ${questionId} (Category: ${question.category})...`);
    const evaluation = await evaluateAnswer(question.questionText, userAnswerText, question.category);
    console.log(`✅ Feedback generated. Score: ${evaluation.score}/10`);

    // 4. Save the submission and feedback in the database
    const savedAnswer = await prisma.answer.create({
      data: {
        userId: parseInt(userId),
        questionId: parseInt(questionId),
        userAnswerText: userAnswerText,
        aiScore: evaluation.score,
        aiFeedback: {
          whatWasDoneWell: evaluation.whatWasDoneWell,
          actionableInsights: evaluation.actionableInsights,
          optimizedAnswer: evaluation.optimizedAnswer
        }
      },
      include: {
        question: true
      }
    });

    res.status(201).json(savedAnswer);
  } catch (error) {
    console.error("❌ Error in answer submission route:", error);
    res.status(500).json({ error: "Internal Server Error in generating AI feedback." });
  }
});

module.exports = router;
