import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName: string) {
  try {
    console.log(`\nTesting ${modelName}...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(`✅ ${modelName} works!`);
    console.log(`Response: ${result.response.text()}`);
    return true;
  } catch (error: any) {
    console.log(`❌ ${modelName} failed: ${error.message?.split('\n')[0] || error}`);
    return false;
  }
}

async function listModels() {
  console.log("Testing Gemini API key with different models...");
  console.log(`API Key: ${apiKey?.substring(0, 20)}...`);
  
  const modelsToTest = [
    "gemini-pro",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
    "models/gemini-pro",
    "models/gemini-1.5-pro",
    "models/gemini-1.5-flash",
  ];
  
  let workingModel = null;
  
  for (const modelName of modelsToTest) {
    const works = await testModel(modelName);
    if (works && !workingModel) {
      workingModel = modelName;
    }
  }
  
  if (workingModel) {
    console.log(`\n\n🎉 SUCCESS! Use this model: "${workingModel}"`);
  } else {
    console.log("\n\n❌ No working models found. API key may be invalid or not enabled for Gemini API.");
  }
}

listModels();
