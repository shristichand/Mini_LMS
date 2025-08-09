const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const authroutes = require("./routes/authroutes");
const courseroutes = require("./routes/courseroutes");
const lessonroutes = require("./routes/lessonroutes");
const progressroutes = require("./routes/progressroutes");
const cors = require("cors");

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true,               
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", authroutes);
app.use("/api/courses", courseroutes);
app.use("/api/courses", lessonroutes);
app.use("/api", progressroutes);

module.exports = app;
