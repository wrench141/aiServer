import Groq from "groq-sdk";
import { getCurrentTime, runCommand } from "./utils.js";
import fs from "fs";


let chat_history = [];

fs.readFile("./memory.json", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return err;
  } else {
    try {
      chat_history = JSON.parse(data); // Parse the JSON string into an array
    } catch (parseErr) {
      console.log("Error parsing JSON:", parseErr);
      return parseErr;
    }

    // Now you can use chat_history.map
    const formattedChatHistory = chat_history.map((entry) => ({
      role: "system",
      content: `CHAT HISTORY :: Query: ${entry.query}, Response: ${entry.response}, timeOfCreation: ${entry.created_At}`,
    }));

    console.log(formattedChatHistory); // Log the formatted chat history
  }
});

const groq = new Groq({
  apiKey: "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",
});

function writeMemory(newObject, filePath) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      [...JSON.parse(fs.readFileSync(filePath, "utf8")), newObject],
      null,
      2
    )
  );
  console.log("New object appended to file successfully!");
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
        content:
          "you are wrench jnr, an assistant ai with human like conversation",
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
  writeMemory(
    {
      role: "system",
      query: query,
      response: complete_response,
      memory_ID: conv_id,
      created_At: new Date(),
    },
    "./memory.json"
  );
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


export default runQuery;
