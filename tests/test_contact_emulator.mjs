import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { fileURLToPath } from 'url';
import path from 'path';

// Load the root .env file (Built-in for Node.js >= 21.7)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.loadEnvFile(path.resolve(__dirname, '../.env'));

// Mock Config to initialize the Firebase Client SDK
const app = initializeApp({
  projectId: "calorie-swipe",
  apiKey: "mock-api-key"
});

const functions = getFunctions(app);

// Connect to the local emulator as requested
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

console.log("Connected to Functions Emulator at 127.0.0.1:5001");

/**
 * Testing an `onRequest` function is usually done with a standard fetch request.
 */
const runFetchTest = async () => {
  console.log("Testing submitContact via standard fetch...");
  try {
    const url = "http://127.0.0.1:5001/calorie-swipe/us-central1/submitContact";
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test.contact@example.com",
        source: "contact",
        topic: "feature_request",
        message: "This is a test feature request message.",
      })
    });

    // Check if the response was ok and log
    if (response.ok) {
        const text = await response.text();
        console.log("Success:", text);
    } else {
        const error = await response.text();
        console.error(`Error (${response.status}):`, error);
    }
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
};

runFetchTest();
