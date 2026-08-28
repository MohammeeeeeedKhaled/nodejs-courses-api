const express = require("express");


const coursesController = require("../controllers/courses.controller");
const router = express.Router();
const validationSchema = require("../middleware/middlewareSchema");
const verifyToken = require("../middleware/verifyToken");
const userRoles = require("../utils/user.roles");
const allowedTo = require("../middleware/allowedTo");
//CRUD (Create, Read, Update, Delete)

//Route->Resource->Controller
router  
  .route("/")
  .get(coursesController.getAllCourses)
  .post(verifyToken,allowedTo(userRoles.MANAGER),validationSchema, coursesController.createCourse);

router
  .route("/:courseId")
  .get(coursesController.getCourse)
  .patch(coursesController.updateCourse)
  .delete(verifyToken,allowedTo(userRoles.ADMIN,userRoles.MANAGER),coursesController.deleteCourse);

module.exports = router;
