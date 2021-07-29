const express = require("express");
const app = express();

const videoRouter = require("./routes/videoRoute");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", videoRouter);

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});

