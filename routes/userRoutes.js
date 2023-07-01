const express = require('express');
const userController = require('./../Controller/UserController');
const authController = require('./../Controller/authController');

const router = express.Router();




router.post('/signup', authController.signup );
router.post('/login', authController.login );
router.get('/logout', authController.logout);
router.post('/forgetPassword', authController.forgetPassword );
router.patch('/resetPassword/:token', authController.resetPassword );

router.use(authController.protect)


router.patch('/UpdateMyPassword', authController.updatePassword );

router.patch('/UpdateMe' ,userController.uploadUserPhoto, userController.resizeUserPhoto, userController.UpdateMe );

router.delete('/DeleteMe' , userController.deleteMe );

router.get('/me',userController.getMe,userController.getUserID);



router.use(authController.restrictTo('admin'));


router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserID)
  .patch(userController.UpdateUser)
  .delete(userController.DeleteUser);



module.exports = router;