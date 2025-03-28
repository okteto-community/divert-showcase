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
  // propagate the baggage headers to allow the receiving service to make runtime decisions
  var options = { headers: {} };
  const divertKey = getDivertKey(headers);
  if (divertKey) {
    options.headers["baggage.okteto-divert"] = divertKey;
    //add other headers that you might need to propagate
  }

  return options;
}

async function callDownstreamService(req) {
  const url = `https://${req.headers.host}/serviceb/chain`;
  const options = buildHeaders(req.headers);
  console.log(`calling service ${url} with headers ${options.headers}`);

  return await got(url, options).text();
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
