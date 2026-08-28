const User = require("../models/user.model");
const generateToken =require('../utils/generateJwt');
require("dotenv").config();
const { body, validationResult } = require("express-validator");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const bcrypt=require('bcryptjs');
const jwt = require('jsonwebtoken');
const getAllUsers = asyncWrapper(async (req, res) => {
    // console.log(req.headers)
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const users = await User.find({}, { __v: false ,password:false}).limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});
const register = asyncWrapper(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  // console.log('req.file--->',req.file);
  const findUser = await User.findOne({ email: email });
  if (findUser) {
    const error = AppError.create('This email exist email must be unique', 400, httpStatusText.FAIL);
    return next(error);
  }
   const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password:hashedPassword,
    role,
    avatar:req.file.filename
  });
  //generate JWT
  const token=await generateToken({email:newUser.email,id:newUser._id,role:newUser.role});
//   console.log("token",token);
  newUser.token=token;
  await newUser.save();
  return res
    .status(200)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});
const login = asyncWrapper(async(req,res,next) => {
     const {  email, password } = req.body;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    const error = AppError.create('Invalid email or password', 400, httpStatusText.FAIL);
    return next(error);
  }
  const  comparedPass = await bcrypt.compare(password,findUser.password); 
  if (findUser&&comparedPass) {
     const token=await generateToken({email:findUser.email,id:findUser._id,role:findUser.role});
      return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data:{token} });
    }
    const error = AppError.create('Some thing wrong try again', 400, httpStatusText.FAIL);
    return next(error);
})
module.exports = {
  getAllUsers,
  register,
  login,
};
