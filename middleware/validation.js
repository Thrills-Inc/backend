import { body, validationResult } from "express-validator";

import ApiError from "../utils/ApiError.js";

// VALIDATION RESULT HANDLER
export const validate = (
  req,
  res,
  next
) => {

  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {

    return next(
      new ApiError(
        400,
        errors.array()[0].msg
      )
    );

  }

  next();

};

// REGISTER VALIDATION
export const registerValidation = [

  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Name is required."
    ),

  body("username")
    .trim()
    .isLength({
      min: 3,
      max: 30,
    })
    .withMessage(
      "Username must be between 3 and 30 characters."
    ),

  body("email")
    .isEmail()
    .withMessage(
      "Invalid email address."
    ),

  body("password")
    .isLength({
      min: 6,
    })
    .withMessage(
      "Password must be at least 6 characters."
    ),

];










// export const registerValidation = [

//   body("username")
//     .trim()
//     .notEmpty()
//     .withMessage("Username is required")
//     .isLength({ min: 3, max: 20 })
//     .withMessage(
//       "Username must be 3-20 characters"
//     ),

//   body("email")
//     .isEmail()
//     .withMessage("Invalid email"),

//   body("password")
//     .isLength({ min: 6 })
//     .withMessage(
//       "Password must be at least 6 characters"
//     ),

//   body("name")
//     .trim()
//     .notEmpty()
//     .withMessage("Name is required"),

// ];

// LOGIN VALIDATION
export const loginValidation = [

  body("email")
    .notEmpty()
    .withMessage(
      "Email or username is required"
    ),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    ),

];

// POST VALIDATION
export const postValidation = [

  body("desc")
    .optional()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Post is too long."
    ),

];








// export const postValidation = [

//   body("desc")
//     .trim()
//     .isLength({ max: 500 })
//     .withMessage(
//       "Post cannot exceed 500 characters"
//     ),

// ];

// COMMENT VALIDATION
export const commentValidation = [

  body("desc")
    .trim()
    .notEmpty()
    .withMessage(
      "Comment cannot be empty."
    ),

  body("postId")
    .isNumeric()
    .withMessage(
      "Invalid post."
    ),

];









// export const commentValidation = [

//   body("desc")
//     .trim()
//     .notEmpty()
//     .withMessage("Comment is required")
//     .isLength({ max: 300 })
//     .withMessage(
//       "Comment too long"
//     ),

// ];

// MESSAGE VALIDATION
export const messageValidation = [

  body("conversationId")
    .isNumeric()
    .withMessage(
      "Invalid conversation."
    ),

  body("text")
    .trim()
    .notEmpty()
    .withMessage(
      "Message cannot be empty."
    ),

];


export const followValidation = [

  body("userId")
    .isNumeric()
    .withMessage(
      "Invalid user."
    ),

];


export const interestValidation = [

  body("interests")
    .isArray({
      min: 1,
    })
    .withMessage(
      "Select at least one interest."
    ),

];


export const updateUserValidation = [

  body("name")
    .optional()
    .isLength({
      min: 2,
      max: 50,
    }),

  body("website")
    .optional()
    .isURL()
    .withMessage(
      "Invalid website URL."
    ),

];











// export const messageValidation = [

//   body("text")
//     .trim()
//     .notEmpty()
//     .withMessage("Message is required")
//     .isLength({ max: 1000 })
//     .withMessage(
//       "Message too long"
//     ),

// ];