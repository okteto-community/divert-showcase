import got from "got";
import express from "express";

const app = express();
const oktetoDivertHeader = "baggage.okteto-divert";
const PORT = 8080;

async function callDownstreamService(headers) {
  var serviceHost = "servicec";
  if (headers && headers[oktetoDivertHeader]) {
    serviceHost = `${serviceHost}.${headers[oktetoDivertHeader]}`;
  }

  // since we are going directly to the service instead of through the ingress, we propagate the baggage headers in
  const options = {
    headers: {
      "baggage.okteto-divert": headers[oktetoDivertHeader],
    },
  };

  var url = `http://${serviceHost}:8080/chain`;
  return await got(url, undefined, options).text();
}

app.get("/", function (req, res) {
  res.send("Service B says hello!");
});

app.get("/chain", async function (req, res) {
  console.log("/chain request");

  try {
    const data = await callDownstreamService().text();
    const message = `Service B says hello from ${process.env.OKTETO_NAMESPACE}! <br />`;
    res.send(message + data);
  } catch (error) {
    console.log(error);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, function () {
  console.log("Started service-b server on %d", PORT);
});
