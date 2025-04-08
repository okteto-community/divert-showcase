import express from "express";
import { sendMesage } from "./kafka.js";
const app = express();
const PORT = 8080;

app.get("/", function (req, res) {
  res.send("Producer says hello!");
});

app.get("/send", async function (req, res) {
  console.log("/send request");
  console.log("headers:");
  for (var key in req.headers) {
    console.log(`- ${key}: ${req.headers[key]}`);
  }

  const message = `Hello world at ${new Date()}`;
  try {
    await sendMesage(message, req.headers);
    res.send(`Message sent successfully: ${message}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending message to broker");
  }
});

app.listen(PORT, function () {
  console.log("Started producer server on %d", PORT);
});
