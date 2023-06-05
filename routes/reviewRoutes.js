const express = require('express');
const reviewController = require('./../Controller/reviewController');
const authController = require('./../Controller/authController');

const router = express.Router({ mergeParams:true});

router.use(authController.protect);


  router.route('/')
    .get(reviewController.getAllReviews)
    .post(
      authController.restrictTo('user','admin'),
      reviewController.SetTourUserIds,
      reviewController.createReview);

  router.route('/:id')
    .get(reviewController.getReviewID)


    .delete(authController.restrictTo('user','admin')
      ,reviewController.DeleteReview)

    .patch(authController.restrictTo('user','admin'),
      reviewController.UpdateReview)


module.exports = router;