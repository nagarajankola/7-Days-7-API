const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

require("./database/conn");

const PORT = process.env.PORT;

const app = require("./app");

app.get("/", (req, res) => {
  res.send("working!");
});


app.listen(PORT, (req, res) => {
  console.log(`Server alive at ${PORT}`);
});
