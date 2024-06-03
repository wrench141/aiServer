import express, { response } from "express";
import http from "http";
import { Server as SocketIoServer } from "socket.io";
import cors from "cors";
import runQuery from "./aiConfig.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

function generateHexId() {
  return Math.floor(Math.random() * 0xfffff * 1000000).toString(16);
}

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new SocketIoServer(server, {
  cors: {
    origins: ["*"],
  },
  handlePreflightRequest: (req, res) => {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST",
      "Access-Control-Allow-Headers": "my-custom-header",
      "Access-Control-Allow-Credentials": true,
    });
    res.end();
  },
});


io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("query", async(query) => {
    console.log("Query received:", query);
    let conv_id = generateHexId();
    socket.emit("convid", conv_id);
    runQuery(query, conv_id, (response) => {
      socket.emit("response", response, conv_id);
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

if(connectDB()){
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}else{
  console.log("DB Error")
}
