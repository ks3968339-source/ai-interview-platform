const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/users/profile - Returns/upserts default user
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.upsert({
      where: { email: "john.doe@example.com" },
      update: {},
      create: {
        name: "John Doe",
        email: "john.doe@example.com"
      }
    });
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching/creating default user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/users/:userId/performance - Get aggregated statistics and history
router.get('/:userId/performance', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid User ID" });
    }

    // 1. Fetch user to ensure they exist
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Fetch all answers submitted by this user, including question details
    const answers = await prisma.answer.findMany({
      where: { userId },
      include: {
        question: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Calculate aggregate stats
    const totalAnswered = answers.length;
    let averageScore = 0;
    
    // Category metrics
    const categoryStats = {
      "Database Management Systems": { totalScore: 0, count: 0 },
      "Core Programming": { totalScore: 0, count: 0 },
      "Data Structures and Algorithms": { totalScore: 0, count: 0 },
      "Behavioral": { totalScore: 0, count: 0 }
    };

    if (totalAnswered > 0) {
      const sum = answers.reduce((acc, curr) => acc + curr.aiScore, 0);
      averageScore = Math.round((sum / totalAnswered) * 10) / 10;

      answers.forEach(ans => {
        const cat = ans.question.category;
        if (categoryStats[cat]) {
          categoryStats[cat].totalScore += ans.aiScore;
          categoryStats[cat].count += 1;
        }
      });
    }

    // Format category scores cleanly (0 if not answered)
    const categoryBreakdown = {};
    Object.keys(categoryStats).forEach(cat => {
      const stat = categoryStats[cat];
      categoryBreakdown[cat] = stat.count > 0 
        ? Math.round((stat.totalScore / stat.count) * 10) / 10 
        : 0;
    });

    // Extract recent score history for charts (chronological order)
    const history = [...answers].reverse().map(ans => ({
      answerId: ans.id,
      questionId: ans.questionId,
      questionText: ans.question.questionText,
      category: ans.question.category,
      difficulty: ans.question.difficulty,
      score: ans.aiScore,
      feedback: ans.aiFeedback,
      date: ans.createdAt
    }));

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      metrics: {
        totalAnswered,
        averageScore,
        categoryBreakdown
      },
      history
    });
  } catch (error) {
    console.error("❌ Error calculating user performance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
