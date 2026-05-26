const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so our React frontend can safely fetch the APIs
app.use(cors({
  origin: '*', // For development flexibility
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming request JSON payloads
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/answers', require('./routes/answer.routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 AI Interview Platform Server running on http://localhost:${PORT}`);
});
