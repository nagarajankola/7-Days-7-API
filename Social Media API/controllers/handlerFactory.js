const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIfeatures = require("../utils/apiFeatures");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = new Model(req.body);
    const response = await doc.save();
    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //   To allow nested get reviews on tour
    let filter = {};
    if (req.params.tourId) {
      filter = {
        tour: req.params.tourId,
      };
    }

    // EXECUTE QUERY
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (populateOptions) {
      features.query = features.query.populate(populateOptions);
    }
    console.log(features)
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      result: doc.length,
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No doc found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: "successfully deleted",
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    //   If it consists of populate this snippet will help structuring the query
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      qurey = query.populate(populateOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  });
