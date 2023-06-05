const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory');
const Tour = require('../models/tourModel');



exports.SetTourUserIds = catchAsync(async (req,res,next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();

});
exports.getAllReviews = factory.getAll(Review)
exports.getReviewID = factory.getOne(Review);
exports.createReview = factory.CreateOne(Review);
exports.DeleteReview = factory.deleteOne(Review);
exports.UpdateReview = factory.UpdateData(Review);


