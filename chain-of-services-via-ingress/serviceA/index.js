import got from "got";
import express from "express";

const app = express();
const PORT = 8080;

async function callDownstreamService(req) {
  const url = `https://${req.headers.host}/serviceb/chain`;
  console.log(`calling service ${url}`);
  return await got(url).text();
}

app.get("/servicea", function (req, res) {
  res.send("Service A says hello!");
});

app.get("/servicea/chain", async function (req, res) {
  console.log("/chain request");

  try {
    const data = await callDownstreamService(req);
    const message = `Service A says hello from ${process.env.OKTETO_NAMESPACE}! <br />`;
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
  console.log("Started service-A server on %d", PORT);
});
