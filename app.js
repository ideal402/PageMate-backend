const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const indexRouter = require("./routes/index.js");

require("dotenv").config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", indexRouter);

const mongoURI = process.env.DB_ADDRESS;

mongoose
  .connect(mongoURI)
  .then(() => console.log("mongoose connected"))
  .catch((error) => console.log("DB connected fail:", error));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`server is on ${process.env.PORT}`);
});

server.on("error", (error) => {
  console.log("server error: ", error);
});
