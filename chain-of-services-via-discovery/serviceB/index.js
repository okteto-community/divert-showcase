import got from "got";
import express from "express";

const app = express();
const oktetoDivertHeader = "baggage.okteto-divert";
const PORT = 8080;

function getDivertKeyFromHeaders(headers) {
  if (headers && headers[oktetoDivertHeader]) {
    return headers[oktetoDivertHeader];
  }

  return undefined;
}

function buildHeaders(headers) {
  var options = { headers: {} };
  const divertKey = getDivertKeyFromHeaders(headers);
  if (divertKey) {
    options.headers["baggage.okteto-divert"] = divertKey;
    //add other headers that you might need to propagate
  }

  return options;
}

async function callDownstreamService(headers) {
  // propagate the baggage headers to allow the receiving service to make runtime decisions
  console.log(`calling downstream service with headers:`);

  Object.keys(headers).forEach((key) => {
    console.log(`${key}: ${headers[key]}`);
  });

  const options = buildHeaders(headers);
  const serviceUrl = `http://servicec:8080/chain`;
  console.log(`calling ${serviceUrl}`);
  return await got(serviceUrl, options).text();
}

app.get("/", function (req, res) {
  res.send("Service B says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");

  try {
    const data = await callDownstreamService(req.headers);
    const message = `Service B says hello from ${process.env.OKTETO_NAMESPACE}! <br />`;
    res.send(message + data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, function () {
  console.log("Started service-b server on %d", PORT);
});
