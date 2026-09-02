const express = require("express");
const usersController = require("../controllers/users.controller");
const router = express.Router();
const validationSchema = require("../middleware/middlewareSchema");
const verifyToken = require("../middleware/verifyToken");
const allowedTo = require('../middleware/allowedTo');
const userRoles = require('../utils/user.roles');
const multer = require("multer");
const appError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("FILE", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});
const imageFilter = (req, file, cb) => {
  const ext = file.originalname.split(".").pop().toLowerCase();

  const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      appError.create(
        "images allowed only this invlid ",
        400,
        httpStatusText.FAIL,
      ),
      false,
    );
  }
};
const upload = multer({ storage: diskStorage, fileFilter: imageFilter });
router
  .route("/")
  .get(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    usersController.getAllUsers,
  );

router
  .route("/register")
  .post(upload.single("avatar"), usersController.register);
router.route("/login").post(usersController.login);
module.exports = router;
