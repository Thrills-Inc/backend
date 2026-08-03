import request from "supertest";
import express from "express";

import {
  validate,
  registerValidation,
  loginValidation,
} from "../../middleware/validation.js";

const app = express();

app.use(express.json());

app.post(
  "/register",
  registerValidation,
  validate,
  (req, res) => {
    res.status(200).json("OK");
  }
);

app.post(
  "/login",
  loginValidation,
  validate,
  (req, res) => {
    res.status(200).json("OK");
  }
);

app.use(
  (err, req, res, next) => {
    res
      .status(err.statusCode)
      .json(err.message);
  }
);

describe(
  "Register Validation",
  () => {

    test(
      "should reject empty name",
      async () => {

        const res =
          await request(app)
            .post("/register")
            .send({
              name: "",
              username: "john",
              email: "john@test.com",
              password: "password123",
            });

        expect(
          res.statusCode
        ).toBe(400);

      }
    );

    test(
      "should reject invalid email",
      async () => {

        const res =
          await request(app)
            .post("/register")
            .send({
              name: "John",
              username: "john",
              email: "bad-email",
              password: "password123",
            });

        expect(
          res.statusCode
        ).toBe(400);

      }
    );

    test(
      "should reject short password",
      async () => {

        const res =
          await request(app)
            .post("/register")
            .send({
              name: "John",
              username: "john",
              email: "john@test.com",
              password: "123",
            });

        expect(
          res.statusCode
        ).toBe(400);

      }
    );

    test(
      "should allow valid registration",
      async () => {

        const res =
          await request(app)
            .post("/register")
            .send({
              name: "John Doe",
              username: "john",
              email: "john@test.com",
              password: "password123",
            });

        expect(
          res.statusCode
        ).toBe(200);

      }
    );

  }
);

describe(
  "Login Validation",
  () => {

    test(
      "should reject missing email",
      async () => {

        const res =
          await request(app)
            .post("/login")
            .send({
              password:
                "password123",
            });

        expect(
          res.statusCode
        ).toBe(400);

      }
    );

    test(
      "should reject missing password",
      async () => {

        const res =
          await request(app)
            .post("/login")
            .send({
              email:
                "john@test.com",
            });

        expect(
          res.statusCode
        ).toBe(400);

      }
    );

    test(
      "should allow valid login payload",
      async () => {

        const res =
          await request(app)
            .post("/login")
            .send({
              email:
                "john@test.com",

              password:
                "password123",
            });

        expect(
          res.statusCode
        ).toBe(200);

      }
    );

  }
);