const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  }, photo: String,
  role : {
    type : String,
    enum : ['user', 'admin' , 'lead-guide' , 'guide'],
    default : 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires : Date,
  active : {
    type: Boolean,
    default: true,
    select: false
  }

});

userSchema.pre('save', async function(next){

  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password,12);

  this.passwordConfirm = undefined;

});

// GAMMMMMED
userSchema.pre(/^find/,function(next){

  this.find({active : { $ne: false }});
  next();
});


userSchema.pre('save',function(next){
  if (!this.isModified('password') || this.isNew){
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});


userSchema.methods.comparePassword = async function(plainTextPassword,hashedPassword){
  return await bcrypt.compare(plainTextPassword,hashedPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function(){

  //   passwordResetToken: String,
  //   passwordResetExpires : Date

  // send to user to reset Password
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken =
    crypto.createHash('sha256')
      .update(resetToken)
      .digest('hex');

  this.passwordResetExpires = Date.now() + 10 *60 *1000;


  return resetToken;

}

  const User = mongoose.model("User", userSchema);

module.exports = User;
