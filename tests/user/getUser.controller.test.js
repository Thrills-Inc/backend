import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

const token = jwt.sign(
  {
    id: 1,
    isAdmin: false,
  },
  process.env.JWT_SECRET
);

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
  "Get User Controller",
  () => {

    test(
      "should fetch user successfully",
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
                  username: "john",
                  email: "john@test.com",
                  password: "hashed",
                },
              ]
            );

          }
        );

        const res =
          await request(app)

            .get("/api/users/find/1")

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.username
        ).toBe("john");

        expect(
          res.body.password
        ).toBeUndefined();

      }
    );

  }
);

























// import request from "supertest";
// import { jest } from "@jest/globals";

// jest.unstable_mockModule(
//   "../../connect.js",
//   () => ({
//     db: {
//       query: jest.fn(),
//     },
//   })
// );

// const { db } =
//   await import("../../connect.js");

// const { default: app } =
//   await import("../../app.js");

//     test(
//   "should fetch user successfully",
//   async () => {

//     db.query.mockImplementation(
//       (q, values, callback) => {
//         callback(null, [
//           {
//             id: 1,
//             username: "john",
//             email: "john@test.com",
//             password: "hashed",
//           },
//         ]);
//       }
//     );

//     const res =
//       await request(app)
//         .get("/api/users/1")
//         .set(
//           "Cookie",
//           [
//             `accessToken=${token}`,
//           ]
//         );

//     expect(
//       res.statusCode
//     ).toBe(200);
//   }
// );
























// db.query.mockImplementation(
//   (q, values, callback) => {
//     callback(null, [
//       {
//         id: 1,
//         username: "john",
//         email: "john@test.com",
//         password: "hashed",
//       },
//     ]);
//   }
// );

// expect(res.statusCode).toBe(200);
// expect(res.body.password).toBeUndefined();
// expect(res.body.username).toBe("john");

// db.query.mockImplementation(
//   (q, values, callback) => {
//     callback(null, []);
//   }
// );

// expect(res.statusCode).toBe(404);

// db.query.mockImplementation(
//   (q, values, callback) => {
//     callback(new Error("DB Error"));
//   }
// );

// expect(res.statusCode).toBe(500);