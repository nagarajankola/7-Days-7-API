const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      trim: true,
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
    likes: [
      // String,
      {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: [true, "Image must have a userID"],
      // unique: [true, "One user cannot like twice"],
      },
    ],
    locations: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
