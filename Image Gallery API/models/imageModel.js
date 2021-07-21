const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An image must have a name"],
  },
  image: {
    type: Array,
    // required: [true, "Image is required"],
  },
  cloudinaryId: {
    type: String,
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Image must have a userID"],
  },
  locations: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
    address: String,
  },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
