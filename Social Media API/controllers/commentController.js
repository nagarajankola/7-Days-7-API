const catchAsync = require("../utils/catchAsync");
const Comment = require("../models/commentModel");
const factory = require("./handlerFactory");

exports.addUserId = (req, res, next) => {
  req.body.user = req.user._id;
  next();
}

exports.addComment = factory.createOne(Comment);

exports.getAllComment = factory.getAll(Comment);

exports.getSingleComment = factory.getOne(Comment);

exports.updateComment = factory.updateOne(Comment);

exports.deleteComment = factory.deleteOne(Comment);
