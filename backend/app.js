const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const authroutes = require("./routes/authroutes");
const cors = require("cors");

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,               
  }));
app.use(express.json());
app.use(cookieParser());
app.use("/api", authroutes);

module.exports = app;
