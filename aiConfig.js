import Groq from "groq-sdk";
import { getCurrentTime, runCommand } from "./utils.js";
import ChatHistory from "./config/model.js";


const groq = new Groq({
  apiKey: "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",
});

let chat_history = [];

async function initializeChatHistory() {
  try {
    chat_history = await ChatHistory.find({});
    console.log("Chat history loaded from database");
  } catch (err) {
    console.error("Error loading chat history:", err);
  }
}

async function writeMemory(newObject) {
  try {
    const chatEntry = new ChatHistory(newObject);
    await chatEntry.save();
    console.log("New object appended to database successfully!");
  } catch (err) {
    console.error("Error writing to MongoDB:", err);
  }
}

async function runQuery(query, conv_id, callback) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: query,
      },
      {
        role: "system",
        content: "you are wrench jnr, an assistant ai with human like conversation",
      },
      {
        role: "system",
        content: "keep your responses short and sweet",
      },
      ...chat_history.map((entry) => ({
        role: entry.role,
        content: `CHAT HISTORY :: Query: ${entry.query}, Response: ${entry.response}, timeOfCreation: ${entry.created_At}`,
      })),
    ],
    model: "llama3-8b-8192",
    temperature: 1,
    max_tokens: 300,
    top_p: 1,
    stream: true,
    stop: null,
  });
  let complete_response = "";
  for await (const chunk of chatCompletion) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      complete_response += content;
      callback(content);
    }
  }
  await writeMemory({
    role: "system",
    query: query,
    response: complete_response,
    memory_ID: conv_id,
    created_At: new Date(),
  });
}

const processInput = async (query) => {
  let response = { content: "" };

  if (
    query.includes("time now") ||
    query.includes("current time") ||
    query.includes("date") ||
    query.includes("time")
  ) {
    response.content = getCurrentTime();
  } else if (query.includes("run")) {
    response.content = await runCommand(query);
  } else {
    let initialResp = await chain.stream({
      input: query,
    });
    for await (const part of initialResp) {
      response.content += part.content;
      console.log(part.content);
    }
  }
  return response;
};

initializeChatHistory().catch(console.error);

export default runQuery;
