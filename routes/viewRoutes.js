const express = require('express');
const viewsController = require('../Controller/ViewController');
const authController = require('../Controller/authController');

const router = express.Router();


router.get('/', viewsController.getOverview);



module.exports = router;
