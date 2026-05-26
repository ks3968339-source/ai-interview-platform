const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Ensure the API key exists
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Evaluates a candidate's answer using Gemini AI and returns structured feedback.
 * @param {string} questionText The text of the question
 * @param {string} userAnswerText The candidate's typed answer
 * @param {string} category The category of the question (e.g. DBMS, OOP, DSA, Behavioral)
 * @returns {Promise<{score: number, whatWasDoneWell: string, actionableInsights: string, optimizedAnswer: string}>}
 */
async function evaluateAnswer(questionText, userAnswerText, category) {
  try {
    // We target gemini-1.5-flash for fast and cost-effective structured responses
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            score: {
              type: "INTEGER",
              description: "An integer score between 1 and 10 evaluating the quality, accuracy, and depth of the answer."
            },
            whatWasDoneWell: {
              type: "STRING",
              description: "A constructive summary of what parts of the candidate's answer were correct and well explained."
            },
            actionableInsights: {
              type: "STRING",
              description: "A detailed list or summary of critical details, edge cases, or complexity considerations that were missed, plus tips to optimize the answer."
            },
            optimizedAnswer: {
              type: "STRING",
              description: "An exemplary, industry-standard model answer for this exact question that the candidate can learn from."
            }
          },
          required: ["score", "whatWasDoneWell", "actionableInsights", "optimizedAnswer"]
        }
      }
    });

    const systemPrompt = `You are an elite software engineering manager and expert technical interviewer.
Your task is to analyze and evaluate the candidate's answer to the given interview question.
Be constructive, rigorous, and highly detailed.

Question Category: ${category}
Interview Question:
"${questionText}"

Candidate's Answer:
"${userAnswerText}"

Generate a structured response adhering strictly to the JSON schema provided. 
For "actionableInsights", make sure to explicitly address the following if applicable to the category:
- DBMS/SQL: indexing, query cost, locking, normalization, scale.
- Core Programming/OOP: principles, maintainability, design patterns, anti-patterns.
- DSA: time complexity (Big O), space complexity, boundary conditions, data structure trade-offs.
- Behavioral: STAR method (Situation, Task, Action, Result), impact, personal ownership, teamwork.`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    
    // Parse and return the JSON payload
    return JSON.parse(responseText);
  } catch (error) {
    console.error("❌ Gemini Evaluation Service Error:", error);
    
    // Graceful fallback response structure in case of API failure
    return {
      score: 5,
      whatWasDoneWell: "Your answer was received, but the AI evaluation service encountered a temporary error. (Gemini API might be overloaded).",
      actionableInsights: "Unable to extract detailed missing points at this moment. Review core concepts regarding: " + category + ".",
      optimizedAnswer: "A model answer is currently unavailable. Please review industry-standard documentation for this question."
    };
  }
}

module.exports = {
  evaluateAnswer
};
