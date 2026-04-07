import 'dotenv/config';
import { z } from 'zod';
import { createAgent, tool } from 'langchain';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-2.5-flash',
});

const getWeather = tool(
  ({ city }) => `It's always sunny in ${city}!`,
  {
    name: 'get_weather',
    description: 'Get the weather for a given city',
    schema: z.object({
      city: z.string(),
    }),
  },
);

const agent = createAgent({
  model,
  tools: [getWeather],
});

const response = await agent.invoke({
  messages: [{ role: 'user', content: "What's the weather in Tokyo?" }],
});

console.log(response.messages.at(-1).content);