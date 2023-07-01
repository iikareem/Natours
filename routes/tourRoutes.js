const express = require('express');
const tourController = require('./../Controller/TourController');
const authController = require('./../Controller/authController');
const reviewRoute = require('./../routes/reviewRoutes');
const { restrictTo } = require('../Controller/authController');

const router = express.Router();

// router.param('id',tourController.checkID);

router.route('/top-5-cheap')
  .get(tourController.toptours,tourController.GetAllTours);

router.route('/tour-stat')
  .get(tourController.getTourStats);

router.route('/monthly-plan/:year')
  .get(authController.protect, authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);


router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);


router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);


router
  .route('/')
  .get(tourController.GetAllTours)   // Get All Tours
  .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);  // Add New Data

router
  .route('/:id')
  .get(tourController.GetTourByID)  // Get By ID
  .patch(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.uploadTourImages,
    tourController.resizeTourImage
    ,tourController.UpdateData)  // UPDATE BY ID
  .delete(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.DeleteTour); // Delete BY ID

router.use('/:tourId/reviews',reviewRoute);

module.exports = router;