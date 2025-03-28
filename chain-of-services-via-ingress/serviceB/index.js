import got from "got";
import express from "express";

const app = express();
const PORT = 8080;

function getDivertKey(headers) {
  if (headers && headers[oktetoDivertHeader]) {
    return headers[oktetoDivertHeader];
  }

  return undefined;
}

function buildHeaders(headers) {
  // since we are going directly to the service instead of through the ingress, we ned to propagate the baggage headers.
  // This allows the receiving service to make runtime decisions
  var options = { headers: {} };
  const divertKey = getDivertKey(headers);
  if (divertKey) {
    options.headers["baggage.okteto-divert"] = divertKey;
    //add other headers that you might need to propagate
  }

  return options;
}

async function callDownstreamService(headers) {
  const url = `https://${headers.host}/servicec/chain`;
  const options = buildHeaders(headers);
  console.log(`calling service ${url}`);
  return await got(url, options).text();
}

app.get("/serviceb", function (req, res) {
  res.send("Service B says hello!");
});

app.get("/serviceb/chain", async function (req, res) {
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

app.use(function (req, res, next) {
  res.status(404).send("404: Sorry! Page not found.");
  console.log("404 error occurred:", req.url);
});

app.listen(PORT, function () {
  console.log("Started service-b server on %d", PORT);
});
