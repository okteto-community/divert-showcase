import got from "got";
import express from "express";

const app = express();
const oktetoDivertHeader = "baggage.okteto-divert";
const PORT = 8080;

function getDivertKey(headers) {
  if (headers && headers[oktetoDivertHeader]) {
    return headers[oktetoDivertHeader];
  }

  return undefined;
}

function buildTargetServiceHost(headers) {
  var targetServiceHost = "servicec";
  const divertKey = getDivertKey(headers);
  if (divertKey) {
    // when diverted, route the request to the service on the diverted namespace.
    targetServiceHost = `${targetServiceHost}.${divertKey}`;
  }

  return targetServiceHost;
}

function buildHeaders(headers) {
  // since we are going directly to the service instead of through the ingress, we ned to propagate the baggage headers.
  // This allows the receiving service to make runtime decisions
  var options = { headers: {} };
  const divertKey = getDivertKey(headers);
  if (divertKey) {
    options.headers["baggage.okteto-divert"] = divertKey;
  }

  return options;
}

async function callDownstreamService(headers) {
  const options = buildHeaders(headers);
  var url = `http://${buildTargetServiceHost()}:8080/chain`;
  return await got(url, undefined, options).text();
}

app.get("/", function (req, res) {
  res.send("Service B says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");

  try {
    const data = await callDownstreamService();
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
