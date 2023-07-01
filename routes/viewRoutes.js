const express = require('express');
const viewsController = require('../Controller/ViewController');
const authController = require('../Controller/authController');

const router = express.Router();

// router.use(authController.isLoggedIn);

router.get('/',authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug',authController.isLoggedIn,viewsController.getTour);
router.get('/login',authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me',authController.protect, viewsController.getAccount);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);


module.exports = router;
