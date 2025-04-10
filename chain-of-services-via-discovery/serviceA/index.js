import got from "got";
import express from "express";

const oktetoDivertHeader = "baggage.okteto-divert";
const app = express();
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

function buildTargetServiceUrl(headers) {
  const divertKey = getDivertKeyFromHeaders(headers);
  if (divertKey) {
    // when diverted, route the request to the service on the diverted namespace.
    return `https://serviceb-${divertKey}.${process.env.OKTETO_DOMAIN}/chain`;
  }

  // by default, route the request to the service on the current namespace.
  return `https://serviceb-${process.env.OKTETO_NAMESPACE}.${process.env.OKTETO_DOMAIN}/chain`;
}

async function callDownstreamService(headers) {
  // propagate the baggage headers to allow the receiving service to make runtime decisions
  console.log(`calling downstream service with headers:`);

  Object.keys(headers).forEach((key) => {
    console.log(`${key}: ${headers[key]}`);
  });

  const serviceUrl = buildTargetServiceUrl(headers);
  const options = buildHeaders(headers);

  console.log(
    `calling ${serviceUrl} with headers: ${JSON.stringify(options.headers)}`,
  );

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
