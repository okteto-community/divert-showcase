import got from "got";
import express from "express";

const app = express();
const PORT = 8080;

async function callDownstreamService(req) {
  const url = `https://${req.headers.host}/servicec/chain`;
  console.log(`calling service ${url}`);
  return await got(url).text();
}

app.get("/serviceb", function (req, res) {
  res.send("Service B says hello!");
});

app.get("/serviceb/chain", async function (req, res) {
  console.log("/chain request");

  try {
    const data = await callDownstreamService(req);
    const message = `Service B says hello from ${process.env.OKTETO_NAMESPACE}! <br />`;
    res.send(message + data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.use(function (req, res, next) {
  res.status(404).send("404: Sorry! Page not found.");
  console.log("404 error occurred:", req.url);
});

app.listen(PORT, function () {
  console.log("Started service-b server on %d", PORT);
});
