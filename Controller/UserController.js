const express = require('express');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./handlerFactory');

const filterObj = (obj , ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el=>{
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}


exports.UpdateMe = catchAsync(async (req,res,next)=>{

  console.log(req.body);
  if (req.body.password || req.body.password ){
    return next(new AppError('This Route not for Updated Password',400));
  };

  const filteredBody = filterObj(req.body,'name','email');
  console.log(filteredBody);
  const updatedUser = await User.findByIdAndUpdate(req.user.id , filteredBody , {
    new:true,
    runValidators:true
  })

  res.status(200).json({
    status: 'Success'
  })

})

exports.deleteMe = catchAsync(async (req,res,next)=>{

  await User.findByIdAndUpdate(req.user.id , {active: false});

  res.status(204).json({
    status: 'success',
    data:null
  })
  next();

})



exports.createUser = (req,res) =>{
  res.status(500).json({
    status: "error",
    message: "This Route Is Not Yet Defined"
  });
};

exports.getMe = (req,res,next) => {

  req.params.id = req.user.id;
  next();

}

exports.getAllUsers = factory.getAll(User);
exports.getUserID = factory.getOne(User);
exports.UpdateUser = factory.UpdateData(User);
exports.DeleteUser = factory.deleteOne(User);