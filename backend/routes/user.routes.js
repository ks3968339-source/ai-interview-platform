const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'talentflow_jwt_secret_token_12345';

// Helper function to decode token and retrieve active authenticated user
const getAuthenticatedUser = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return await prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch (e) {
    return null;
  }
};

// POST /api/users/signup - Registers a new candidate with hashed password
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please enter your name, email, and password." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "This email address is already registered." });
    }

    // Hash the password hash securely using 10 rounds of salts
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword
      }
    });

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error during registration" });
  }
});

// POST /api/users/login - Authenticates candidate and signs a secure JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Please provide both email and password." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error during login" });
  }
});

// GET /api/users/profile - Returns/upserts dynamic logged-in user or default user
router.get('/profile', async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (authUser) {
      return res.json(authUser);
    }
    // Fallback to default user to prevent page crashes when not authorized yet
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
    console.error("❌ Error fetching profile:", error);
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
