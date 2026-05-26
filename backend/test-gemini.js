const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
    try {
        console.log("Testing API Key:", process.env.GEMINI_API_KEY.substring(0, 5) + "...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("Response:", result.response.text());
    } catch (error) {
        console.error("GEMINI ERROR:", error);
    }
}
test();
