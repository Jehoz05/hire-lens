// test-gemini-sdk-correct.js
import { GoogleGenAI } from "@google/genai";

// Get API key from environment
const API_KEY = "AIzaSyD-375jKPoDA3A-6i6RZzjMr-AydyKUuPI";

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

async function testSDK() {
  try {
    console.log("Testing Gemini SDK with correct structure...");

    // Try the simplest request
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: "Say 'Hello World'" }],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 100,
      },
    });

    console.log("✅ Success!");
    console.log("Response:", response.text);

    // Test with response format
    console.log("\nTesting with JSON response...");
    const jsonResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: 'Return JSON with message \'Hello World\': {"message": "Hello World"}',
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 100,
      },
    });

    console.log("JSON Response:", jsonResponse.text);
  } catch (error) {
    console.error("❌ Error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      details: error.details,
    });

    // Check if it's a model issue
    if (error.message?.includes("model") || error.code === 404) {
      console.log("\nTrying different models...");

      const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro",
      ];

      for (const model of modelsToTry) {
        try {
          console.log(`\nTrying model: ${model}`);
          const testResponse = await ai.models.generateContent({
            model: model,
            contents: [
              {
                role: "user",
                parts: [{ text: "Test" }],
              },
            ],
            config: {
              maxOutputTokens: 10,
            },
          });

          console.log(`✅ ${model} works!`);
          console.log(`Use this in .env.local: GOOGLE_GEMINI_MODEL=${model}`);
          break;
        } catch (modelError) {
          console.log(`❌ ${model} failed: ${modelError.message}`);
        }
      }
    }
  }
}

testSDK();
