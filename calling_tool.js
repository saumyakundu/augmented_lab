import 'dotenv/config';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from "@langchain/core/tools";
import { HumanMessage } from "@langchain/core/messages";

// 1. Setup the Model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flash',
});

// 2. Define the Tool
const getCatFact = tool(
  async () => {
    console.log("--- [DEBUG]: Tool function is actually running! ---");
    const response = await fetch('https://cat-fact.herokuapp.com/facts/random?animal_type=cat&amount=1');
    const data = await response.json();
    return data.text;
  },
  {
    name: "get_cat_fact",
    description: "Get a random cat fact.",
    schema: z.object({}),
  }
);

// 3. Bind Tool & Invoke
async function run() {
    console.log("--- Starting the Agent ---");
    const modelWithTools = model.bindTools([getCatFact]);

    const res = await modelWithTools.invoke([
        new HumanMessage("Tell me a random cat fact!")
    ]);

    console.log("AI decided to call these tools:", JSON.stringify(res.tool_calls, null, 2));
    
    // Check if the AI actually called the tool
    if (res.tool_calls && res.tool_calls.length > 0) {
        console.log("Success! The LLM triggered the tool.");
    } else {
        console.log("The LLM just replied normally without using the tool.");
        console.log("AI Response:", res.content);
    }
}

run();