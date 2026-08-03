import request from "supertest";
// import app from "../../app.js";

import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../connect.js",
  () => ({
    db: {
      query: jest.fn(),
    },
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Register Controller",
  () => {


    test(
  "should register user successfully",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        // user does not exist
        if (
          callCount === 1
        ) {

          callback(
            null,
            []
          );

        }

        // insert user
        else if (
          callCount === 2
        ) {

          callback(
            null,
            {
              insertId: 1,
            }
          );

        }

      }
    );

    const res =
      await request(app)
        .post(
          "/api/auth/register"
        )
        .send({

          username:
            "john",

          email:
            "john@test.com",

          password:
            "password123",

          name:
            "John Doe",

        });

    expect(
      res.statusCode
    ).toBe(201);

    expect(
      res.body
    ).toBe(
      "User has been created."
    );

  }
);

test(
  "should return 409 when user already exists",
  async () => {

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callback(
          null,
          [
            {
              id: 1,
            },
          ]
        );

      }
    );

    const res =
      await request(app)
        .post(
          "/api/auth/register"
        )
        .send({

          username:
            "john",

          email:
            "john@test.com",

          password:
            "password123",

          name:
            "John Doe",

        });

    expect(
      res.statusCode
    ).toBe(409);

    expect(
      res.body.message
    ).toBe(
      "Username or email already exists."
    );

  }
);

test(
  "should return 500 when user lookup fails",
  async () => {

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callback(
          new Error(
            "Database failed"
          )
        );

      }
    );

    const res =
      await request(app)
        .post(
          "/api/auth/register"
        )
        .send({

          username:
            "john",

          email:
            "john@test.com",

          password:
            "password123",

          name:
            "John Doe",

        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);

test(
  "should return 500 when insert fails",
  async () => {

    let callCount = 0;

    db.query.mockImplementation(
      (
        q,
        values,
        callback
      ) => {

        callCount++;

        if (
          callCount === 1
        ) {

          callback(
            null,
            []
          );

        }

        else if (
          callCount === 2
        ) {

          callback(
            new Error(
              "Insert failed"
            )
          );

        }

      }
    );

    const res =
      await request(app)
        .post(
          "/api/auth/register"
        )
        .send({

          username:
            "john",

          email:
            "john@test.com",

          password:
            "password123",

          name:
            "John Doe",

        });

    expect(
      res.statusCode
    ).toBe(500);

  }
);
  }
);

//     test(
//       "should reject existing user",
//       async () => {

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callback(
//               null,
//               [
//                 {
//                   id: 1,
//                   email:
//                     "test@test.com",
//                 },
//               ]
//             );

//           }
//         );

//         const res =
//           await request(app)

//             .post(
//               "/api/auth/register"
//             )

//             .send({
//               username: "john",
//               email:
//                 "test@test.com",
//               password:
//                 "password123",
//               name:
//                 "John Doe",
//             });

//         expect(
//           res.statusCode
//         ).toBe(409);

//       }
//     );

//   }
// );