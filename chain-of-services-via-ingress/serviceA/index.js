import got from "got";
import express from "express";

const oktetoDivertHeader = "baggage.okteto-divert";
const app = express();
const PORT = 8080;

async function callDownstreamService(headers) {
  var ns = process.env.OKTETO_NAMESPACE;
  if (headers && headers[oktetoDivertHeader]) {
    ns = headers["baggage.okteto-divert"];
  }

  // since we are going through the ingress, we don't need to propagate headers, Okteto will do it for you
  const url = `https://serviceb-${ns}.${process.env.OKTETO_DOMAIN}/chain`;
  return await got(url).text();
}

app.get("/", function (req, res) {
  res.send("Service A says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");

  try {
    const data = await callDownstreamService(req.headers);
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
