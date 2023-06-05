const AppError = require('./../utils/AppError');

const handleCastErrorDB = err =>{
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message,400);
}

const sendErrorDev = (err,res) =>{
  res.status(err.statusCode).json({
    status : err.status,
    error : err,
    message :err.message,
    stack : err.stack

  });
};

const sendErrorProd = (err,res) =>{

  if (err.isOperational){
    res.status(err.statusCode).json({
      status : err.status,
      message :err.message

    });
  }

};

const handleDuplicateFieldsDB = err =>{
  const value = err.keyValue.name;
  console.log(value);
  const message = `Duplicate field value ${value}. please enter another value`;
  return new AppError(message,400);
}

const handleValidation = err =>{
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message,400);
}


module.exports= (err,req,res,next)=>{


  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development'){
    sendErrorDev(err,res);

  }
  else if (process.env.NODE_ENV === 'production'){
    console.log(err);
    let error = Object.assign(err);
    console.log(error.name);
  if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    if (error.name === 'ValidationError')
      error = handleValidation(error);


    sendErrorProd(error,res);

  }
}