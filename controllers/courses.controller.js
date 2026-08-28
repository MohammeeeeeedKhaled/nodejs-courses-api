// let Courses = require("../data/Courses");
const Course = require("../models/course.model");
const { body, validationResult } = require("express-validator");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper=require('../middleware/asyncWrapper');
const AppError=require('../utils/appError');
const getAllCourses = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  //get all courses from database using mongoose
  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
})

const getCourse = asyncWrapper(async (req, res,next) => {
  // const courseId = +req.params.courseId; //+ to make it int
  // const course = Courses.find((course) => course.id === courseId);
  const course = await Course.findById(req.params.courseId);
  if (!course) {
  //   const error=new Error();
  //   error.message='course not found';
  //   error.statusCode=404;
  const error= AppError.create('course not found',404,httpStatusText.FAIL);
   return next(error);
    // return res.status(404).json({status: httpStatusText.FAIL,data: { course: "course not found" },});
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { course } });
  // try {
  // } catch (err) {
  //   return res.status(400).json({status:httpStatusText.ERROR,data : 'null',message :err.message,code:400});
  // }
});

const updateCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $set: req.body },
    { new: true },
  );
    return res
    .status(200)
    .json({
      status: httpStatusText.SUCCESS,
      data: { course: updatedCourse },
    });
    // try {
    // } catch (err) {
  //   return res
  //     .status(400)
  //     .json({ status: httpStatusText.ERROR, message: err.message });
  // }
})

const createCourse = asyncWrapper(async (req, res,next) => {
  // console.log(req.body);
  //   if(!req.body.name || !req.body.price){
  //     return res.status(400).json({msg:"name and price is required"})
  //   }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const error= AppError.create(errors.array(),400,httpStatusText.FAIL);
   return next(error);
    // return res
    //   .status(400)
    //   .json({ status: httpStatusText.FAIL, data: { errors: errors.array() } });
  }
  // const course = { id: Courses.length + 1, ...req.body };
  // Courses.push(course); //... spread data
  const newCourse = await new Course(req.body);
  newCourse.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { course: newCourse } });
})

const deleteCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  await Course.deleteOne({ _id: courseId });
  res.status(200).json({ status: httpStatusText.SUCCESS, data: "null" });
})

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};
