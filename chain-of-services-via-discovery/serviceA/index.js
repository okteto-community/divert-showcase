import got from "got";
import express from "express";

const oktetoDivertHeader = "baggage.okteto-divert";
const app = express();
const PORT = 8080;

function getDivertKey(headers) {
  if (headers && headers[oktetoDivertHeader]) {
    return headers[oktetoDivertHeader];
  }

  return undefined;
}

function buildHeaders(headers) {
  var options = { headers: {} };
  const divertKey = getDivertKey(headers);
  if (divertKey) {
    options.headers["baggage.okteto-divert"] = divertKey;
    //add other headers that you might need to propagate
  }

  return options;
}

function buildTargetServiceUrl(headers) {
  const divertKey = getDivertKey(headers);
  if (divertKey) {
    // when diverted, route the request to the service on the diverted namespace.
    return `https://serviceb-${divertKey}.${process.env.OKTETO_DOMAIN}/chain`;
  }

  return `https://serviceb-${process.env.OKTETO_NAMESPACE}.${process.env.OKTETO_DOMAIN}/chain`;
}

async function callDownstreamService(headers) {
  // propagate the baggage headers to allow the receiving service to make runtime decisions
  const options = buildHeaders(headers);
  const serviceUrl = buildTargetServiceUrl();
  console.log(`calling ${serviceUrl}`);
  return await got(serviceUrl, options).text();
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
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, function () {
  console.log(
    `Started service-A server on %d\nCall https://servicea-${process.env.OKTETO_NAMESPACE}.${process.env.OKTETO_DOMAIN}/chain to try me out`,
    PORT,
  );
});
