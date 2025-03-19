import got from "got";
import express from "express";

const app = express();
const PORT = 8080;

app.get("/", function (req, res) {
  res.send("Service A says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");
  console.log("headers:");
  for (var key in req.headers) {
    console.log(`- ${key}: ${req.headers[key]}`);
  }

  var ns = process.env.OKTETO_NAMESPACE;
  if (req.headers["baggage.okteto-divert"]) {
    ns = req.headers["baggage.okteto-divert"];
  }

  try {
    const url = `https://serviceb-${ns}.${process.env.OKTETO_DOMAIN}/chain`;
    const data = await got(url, options).text();
    const message = `Service A says hello from ${process.env.OKTETO_NAMESPACE}! <br />`;
    res.send(message + data);
  } catch (error) {
    console.log(error);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, function () {
  console.log("Started service-A server on %d", PORT);
});
