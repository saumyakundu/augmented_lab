import 'dotenv/config';
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flash',
});

const getCatFact = tool(
  async () => {
    console.log("--- [TOOL LOG]: Fetching from MeowFacts API ---");
    
    const response = await fetch('https://meowfacts.herokuapp.com/');
    const json = await response.json();
    
    // MeowFacts returns: { "data": ["The fact string"] }
    const fact = json.data[0]; 
    return fact;
  },
  {
    name: "get_cat_fact",
    description: "Fetches a random interesting fact about cats.",
    schema: z.object({}),
  }
);

const agent = createReactAgent({
  llm: model,
  tools: [getCatFact],
});

async function run() {
  console.log("--- Starting the Agentic Conversation ---");
  
  const response = await agent.invoke({
    messages: [new HumanMessage("Tell me a random cat fact!")],
  });

  console.log("\nAI Response:");
  // This will now print the full sentence from the AI including the fact
  console.log(response.messages.at(-1).content);
}

run();