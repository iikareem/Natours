const express = require('express');
const bookingController = require('./../Controller/bookingController');
const authController = require('./../Controller/authController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);



module.exports = router;