const express = require("express");
const app = express();
const authroutes = require("./routes/authroutes");

app.use(express.json());
app.use("/api", authroutes);

module.exports = app;
