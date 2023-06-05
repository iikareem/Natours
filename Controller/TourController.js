const fs = require('fs');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync')
const ApiFeature = require('./../utils/apiFeatures');
const AppError = require('./../utils/AppError');
const { query } = require('express');
const factory = require('./handlerFactory');




exports.toptours =  (req,res,next) =>{
  req.query.limit = '5'
  req.query.sort = '-ratingsAverage,-price'
  req.query.fields = 'name,price,ratingsAverage,difficulty,summary';
  next();
}









exports.getTourStats = catchAsync(async (req,res) =>{

  const stats = await Tour.aggregate([
    {
      $match:{ratingsAverage :{$gte: 4.5}}
    },
    {
      $group :{
        _id : '$difficulty',
        numTours : {$sum:1},
        numRating :{$sum: '$ratingsQuantity'},
        avgRating :{$avg: '$ratingsAverage'},
        avgPrice :{$avg : '$price'},
        minPrice :{$min : '$price'},
        maxPrice :{$max : '$price'}
      },

    },

    {
      $sort : {avgPrice: 1}
    }

  ])
    res.status(200).json({
      status : 'success',
        stats

    })

  });

exports.getMonthlyPlan = catchAsync(async (req,res) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind : '$startDates'
      },
      {
        $match: {
          startDates:{
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group:{
          _id: {$month : '$startDates'}, // 2001-02-03
          numTourStarts: {$sum: 1},
          tours : {$push: '$name'}
        }
      },
      {
      $addFields : {month: '$_id'}
      },
      {
        $project :
          {
          _id: 0
        }
      },
      {
      $sort: {month : 1}
      }

    ])
    res.status(200).json({
      status : 'success',
      length: plan.length,
      plan

    })
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');


  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat,lng.',
        400
      )
    );
  }

  console.log(lng);
  console.log(lat);
  console.log(radius);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

exports.UpdateData = factory.UpdateData(Tour);
exports.DeleteTour = factory.deleteOne(Tour);
exports.createTour = factory.CreateOne(Tour);
exports.GetTourByID = factory.getOne(Tour,{path : 'reviews'});
exports.GetAllTours = factory.getAll(Tour);
