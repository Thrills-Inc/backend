import express from "express";

import {
  login,
  register,
  logout,
  refreshToken,
} from "../controllers/auth.js";

import {
  authLimiter,
} from "../middleware/rateLimiter.js";

import {
  validate,
  registerValidation,
  loginValidation,
} from "../middleware/validation.js";

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User created successfully
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */

// REGISTER
router.post(
  "/register",
  authLimiter,
  registerValidation,
  validate,
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns access and refresh token cookies.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Wrong password or email
 *       404:
 *         description: User not found
 *       423:
 *         description: Account locked
 *       500:
 *         description: Server error
 */

// LOGIN
router.post(
  "/login",
  authLimiter,
  loginValidation,
  validate,
  login
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token cookie.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: No refresh token
 *       403:
 *         description: Invalid or revoked refresh token
 *       500:
 *         description: Server error
 */

// REFRESH TOKEN
router.post(
  "/refresh-token",
  refreshToken
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Clears access and refresh token cookies and revokes refresh tokens.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User logged out
 *       500:
 *         description: Server error
 */

// LOGOUT
router.post(
  "/logout",
  logout
);

export default router;
























// import express from "express";
// import { login, register, logout, refreshToken } from "../controllers/auth.js";
// import { authLimiter } from "../middleware/rateLimiter.js";
// import {
//   validate,
//   registerValidation,
//   loginValidation,
// } from "../middleware/validation.js";

// const router = express.Router()

// // router.post("/login", authLimiter, login)
// // router.post("/register", authLimiter, register)
// router.post(
//   "/register",
//   authLimiter,
//   registerValidation,
//   validate,
//   register
// );

// // router.post(
// //     "/refresh-token",
// //     refreshToken
// // );


// router.post(
//   "/login",
//   authLimiter,
//   loginValidation,
//   validate,
//   login
// );
// router.post("/logout", logout)


// // router.get("/test", getUser)
// export default router;