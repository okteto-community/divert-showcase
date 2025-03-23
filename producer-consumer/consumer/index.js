import express from "express";
import { startConsumer } from "./kafka.js";
const app = express();

const PORT = 8080;

app.get("/", function (req, res) {
  res.send("Consumer service says hello!");
});

function processMessageCallback(message) {
  // TODO: do a more meanigful processing
  console.log(`Consumed message: ${message}`);
}

startConsumer(processMessageCallback);

app.listen(PORT, function () {
  console.log("Started consumer service on %d", PORT);
});
