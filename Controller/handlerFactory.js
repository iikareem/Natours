const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const ApiFeature = require('./../utils/apiFeatures');


exports.deleteOne = Model => catchAsync(async (req,res,next)=>{

  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc){
    return next(new AppError('No Document Find with that ID',404));
  }

  res.status(204).json({
    status: 'success',
    data : null
  });
});

exports.UpdateData = Model => catchAsync(async (req, res,next) => {

  const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: "ok",
    data:{
      doc
    }
  })
});


exports.CreateOne = Model => catchAsync(async (req, res,next) => {
  const doc = await Model.create(req.body);
  res.status(200).json({
    status: "Success",
    data:{
      doc
    }
  })
});


exports.getOne = (Model, popOptions) => catchAsync(async (req, res,next) => {

  let query = Model.findById(req.params.id);
  if(popOptions) query = query.populate(popOptions);

  const doc = await query;

  if (!doc){
    return next(new AppError('No doc Find with that ID',404));
  }
  res.status(200).json({
    status: 'OK',
    data: {
      doc
    }
  })
});

exports.getAll = Model => catchAsync (async (req, res,next) => {

  // to allow for nested GET Review on tour

  let filter = {};
  if (req.params.tourId) filter = {tour : req.params.tourId }

  const features = new ApiFeature(Model.find(filter), req.query)
    .filter()
    .sorts()
    .limitFields()
    .paginate();



  // const doc = await features.query.explain();
  const doc = await features.query;



  res.status(200).json({
    status : 'success',
    results : doc.length,
    data: {
      doc
    }
  })

});



