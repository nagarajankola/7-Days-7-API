const mongoose = require("mongoose");

DATABASE_URI = process.env.DATABASE_URI;

mongoose
  .connect(DATABASE_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Connection successful!");
  })
  .catch((err) => {
    console.log("Cannot connect to database");
    console.log(err);
  });
