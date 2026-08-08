require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

async function test() {
    console.log("Key exists:", !!process.env.GEMINI_API_KEY);
    console.log(
        "Key preview:",
        process.env.GEMINI_API_KEY?.slice(0, 8) + "..."
    );

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: "Say hello in one sentence."
        });

        console.log("SUCCESS:");
        console.log(response.text);
    } catch (error) {
        console.error("GEMINI FAILED:");
        console.error(error);
    }
}

test();