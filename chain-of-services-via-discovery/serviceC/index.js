import express from "express";
const app = express();

const PORT = 8080;

app.get("/", function (req, res) {
  res.send("Service C says hello!");
});

app.get("/chain", function (req, res) {
  console.log("/chain request");
  res.send(`Service C says hello from ${process.env.OKTETO_NAMESPACE}!`);
});

app.listen(PORT, function () {
  console.log("Started service-c server on %d", PORT);
});
