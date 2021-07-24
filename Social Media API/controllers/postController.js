const fs = require("fs");
const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const cloudinary = require("../utils/cloudinary");
const factory = require("./handlerFactory");

exports.uploadPostDetails = async (req, res, next) => {
  try {
    const uploadCloudinary = await cloudinary.uploader.upload(req.file.path);
    req.body.userID = req.user._id;
    req.body.image = uploadCloudinary.secure_url;
    req.body.cloudinaryId = uploadCloudinary.public_id;
    console.log(req.body);
    const postData = new Post(req.body);

    const post = await postData.save();
    console.log(post);
    res.status(200).json({
      status: "success",
      post,
    });
  } catch (error) {
    console.log(error);
    res.json({
      error,
    });
  }
};

exports.getOnePost = factory.getOne(Post, { path: "comments" });

exports.getAllPost = factory.getAll(Post, { path: "comments" });
// exports.getAllPost = async (req, res) => {
//   const posts = await Post.find().populate("comments");
//   res.json({
//     status: "success",
//     result: posts.length,
//     posts: posts,
//   });
// };

exports.updatePost = factory.updateOne(Post);

exports.deletePost = async (req, res) => {
  try {
    const image = await Post.findById(req.params.id);

    await cloudinary.uploader.destroy(image.cloudinaryId);
    await Post.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "fail",
    });
  }
};

exports.like = catchAsync(async (req, res, next) => {
  const like = await Post.findOneAndUpdate(
    { _id: req.params.id },
    {
      $addToSet: {
        likes: req.user._id,
      },
    }
  );

  res.status(201).json({
    status: "success",
  });
});

exports.dislike = catchAsync(async (req, res, next) => {
  const like = await Post.updateOne(
    { _id: req.params.id },
    {
      $pullAll: {
        likes: [req.user._id],
      },
    }
  );

  res.status(201).json({
    status: "success",
  });
});
