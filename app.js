require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const HttpError = require("./models/http-error");
const usersRoutes = require("./routes/users-routes");
const fileDelete = require("./utils/file-delete");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places/", placesRoutes);
app.use("/api/users/", usersRoutes);

app.use((req, res, next) => {
  return next(new HttpError("Could not find this route", 404));
});

app.use((error, req, res, next) => {
  if (req.file) {
    fileDelete(req.file.location);
  }
  if (res.headersSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose.set("strictQuery", true);
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lwsdsfk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(process.env.PORT || 5000))
  .catch((error) => console.log(error));

module.exports = app;
