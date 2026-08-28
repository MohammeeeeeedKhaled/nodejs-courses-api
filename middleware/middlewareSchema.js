
const { body } = require("express-validator");
const validationSchema =[
      body("name")
        .notEmpty()
        .withMessage("name is required")
        .isLength({ min: 3 })
        .withMessage("name should be at least 3 characters"),
      body("price").notEmpty().withMessage("price is required"),
    ]
    module.exports = validationSchema