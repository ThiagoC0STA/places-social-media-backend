const { truncate } = require("fs/promises");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creatorName: { type: String, required: true },
  creatorImage: { type: String, required: true },
  likes: [{ type: mongoose.Types.ObjectId, required: true }],
  comments: [
    { type: mongoose.Types.ObjectId, required: true },
    { type: Object, required: true },
  ],
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Place", placeSchema);
