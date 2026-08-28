const express = require("express");
require("dotenv").config();
const app = express();
const mongoose = require("mongoose");
const url = process.env.MONGO_URL;
const httpStatusText = require("./utils/httpStatusText");
const cors = require("cors");
const path=require('path');

app.use('/uploads',express.static(path.join( __dirname,'uploads')));









// console.log( process.env.MONGO_URL);
mongoose.connect(url).then(() => {
  console.log("Connected to MongoDB Using Mongoose");
});
app.use(express.json()); //middleware important for bodyparse is exist in express pack
app.use(cors()); //use it solve problem we fetch data from back to front
const coursesRoutes = require("./routes/courses.route");
const usersRoutes = require("./routes/users.route");
app.use("/api/courses", coursesRoutes);
app.use("/api/users", usersRoutes);
//global middleware for not found router
app.all("/*splat", (req, res, next) => {
  return res
    .status(404)
    .json({ status: httpStatusText.ERROR, message: "This Resource Not Found" });
});
// global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});
app.listen(process.PORT || 5000, () => {
  console.log("Server is listening on port 5000");
});
