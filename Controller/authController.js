const {promisify} = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

// Overall, this function generates a signed JWT token
// that can be used to authenticate and authorize a user in a secure manner.
const signToken = id => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

const createSendToken = (user,statusCode,res) =>{


  const token = signToken(user._id);
  const cookieOption = {
    expires : new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly : true
  }

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    data :{
      user
    }
  })
}


exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role : req.body.role
  });

  createSendToken(newUser,201,res);


});


exports.login = catchAsync(async (req,res,next) =>{

  const {email,password} = req.body;

  // If email or password doesnt exist
  if (!email || !password){
  return next(new AppError("Please Provide email and Password !",400));}

  // If user is exists && password gebhom mn el database
  const user = await User.findOne({email}).select('+password');

  // console.log(password);
  // console.log(user);
                                 // Entered Password // Database-encrypted Password
  const compare = await user.comparePassword(password, user.password);


  if (!user || !compare){
    return next(new AppError("Incorrect email or Password !",401));
  }


  createSendToken(user,200,res);



})


exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  // PAYLOAD: DATA
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);


  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  // req.user property is commonly used to store information about the currently authenticated user.
  // By assigning the value of currentUser to req.user,
  // the application is indicating that the user associated with the current request is currentUser.
  console.log(currentUser);
  req.user = currentUser;
  console.log(req.user);
  next();
});

exports.restrictTo = (...roles) =>{
  return (req,res,next) =>{

    console.log(roles);
    if (!roles.includes(req.user.role)){
      return next( new AppError("You don't have permission to perform this action",404))
    }
  next();
  }
}


exports.forgetPassword = catchAsync( async (req,res,next)=>{

  const user = await User.findOne({email : req.body.email});

  if (!user){
    return next(new AppError("There is No User With this email",404))
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();


  user.save({validateBeforeSave: false});


  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Anta shklk nseet el password YAAD a3ml patch request bel password el gdeda we al confirm
  le ${resetURL}.\n lw msh 3amel yb2a ignore this message we 2odmak 10 minus bs haaa !!`;

  try {

  await sendEmail({
    email : req.body.email,
    subject : 'Your Password Token',
    message
  });


  res.status(200).json({
    status : 'Success',
    message: 'token sent'
  })

  } catch (err){
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});

    return next(new AppError("error sending email"),500);

  }

});

exports.resetPassword = async (req,res,next) =>{

  // 1) Get User Based On The Token
  const HashedToken = crypto.createHash('sha256')
    .update(req.params.token)
    .digest('hex');


  const user = await User.findOne({
    passwordResetToken : HashedToken ,
    passwordResetExpires : {$gt: Date.now()}
  });

  if (!user){
    return next(new AppError('Token is invalid or expired',400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();




  createSendToken(user,200,res);


}

exports.updatePassword = catchAsync(async (req,res,next)=>{

// 1) Get user form Database
  console.log(req.user);
  const user = await User.findById(req.user.id).select('+password');

  // 2) check if Posted Current password is correct

  if (!(await user.comparePassword(req.body.passwordCurrent,user.password))){
    return next(new AppError("Your Current Password is Wrong",401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user,200,res);


})


