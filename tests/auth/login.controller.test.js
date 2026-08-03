import request from "supertest";
import { jest } from "@jest/globals";
import bcrypt from "bcryptjs";


process.env.JWT_SECRET =
  "test-secret";

process.env.JWT_REFRESH_SECRET =
  "test-refresh-secret";

jest.unstable_mockModule(
  "../../connect.js",
//   "../../utils/auditLogger.js"
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

describe("Login Controller", () => {



     test(
    "should reject wrong password",
    async () => {

      db.query.mockImplementation(
        (q, values, callback) => {

          if (
            typeof callback === "function"
          ) {

            callback(
              null,
              [
                {
                  id: 1,
                  email: "john@test.com",
                  username: "john",
                  password:
                    bcrypt.hashSync(
                      "correctPassword",
                      10
                    ),
                  role: "user",
                  failedLoginAttempts: 0,
                },
              ]
            );

          }

        }
      );

      const res =
        await request(app)
          .post("/api/auth/login")
          .send({
            email: "john@test.com",
            password: "wrongPassword",
          });

      expect(
        res.statusCode
      ).toBe(400);

    //   expect(
    //     res.headers["set-cookie"]
    //   ).toBeDefined();

    }
  );

});






//   test(
//     "should login successfully",
//     async () => {

//       db.query.mockImplementation(
//         (q, values, callback) => {

//           if (
//             typeof callback === "function"
//           ) {

//             callback(
//               null,
//               [
//                 {
//                   id: 1,
//                   email: "john@test.com",
//                   username: "john",
//                   password:
//                     bcrypt.hashSync(
//                       "password123",
//                       10
//                     ),
//                   role: "user",
//                   failedLoginAttempts: 0,
//                 },
//               ]
//             );

//           }

//         }
//       );

//       const res =
//         await request(app)
//           .post("/api/auth/login")
//           .send({
//             email: "john@test.com",
//             password: "password123",
//           });

//       expect(
//         res.statusCode
//       ).toBe(200);

//       expect(
//         res.headers["set-cookie"]
//       ).toBeDefined();

//     }
//   );

// });






































// import request from "supertest";
// import { jest } from "@jest/globals";
// import bcrypt from "bcryptjs";

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

// describe(
//   "Login Controller",
//   () => {




//     test(
//   "should login successfully",
//   async () => {

//     db.query.mockImplementation(
//       (
//         q,
//         values,
//         callback
//       ) => {

//         callback(
//           null,
//           [
//             {
//               id: 1,
//               email:
//                 "john@test.com",

//               username:
//                 "john",

//               password:
//                 bcrypt.hashSync(
//                   "password123",
//                   10
//                 ),

//               role:
//                 "user",

//               failedLoginAttempts:
//                 0,
//             },
//           ]
//         );

//       }
//     );

//     const res =
//       await request(app)

//         .post(
//           "/api/auth/login"
//         )

//         .send({
//           email:
//             "john@test.com",

//           password:
//             "password123",
//         });

//     expect(
//       res.statusCode
//     ).toBe(200);

//     expect(
//       res.headers["set-cookie"]
//     ).toBeDefined();

//   }
// );

//   }

// );

//     test(
//   "should reject wrong password",
//   async () => {

//     db.query.mockImplementation(
//       (
//         q,
//         values,
//         callback
//       ) => {

//         callback(
//           null,
//           [
//             {
//               id: 1,
//               email:
//                 "john@test.com",

//               username:
//                 "john",

//               password:
//                 bcrypt.hashSync(
//                   "correctpassword",
//                   10
//                 ),

//               failedLoginAttempts:
//                 0,
//             },
//           ]
//         );

//       }
//     );

//     const res =
//       await request(app)

//         .post(
//           "/api/auth/login"
//         )

//         .send({
//           email:
//             "john@test.com",

//           password:
//             "wrongpassword",
//         });

//     expect(
//       res.statusCode
//     ).toBe(400);

//   }
// );

//   }

// );

//     test(
//       "should reject unknown user",
//       async () => {

//         db.query.mockImplementation(
//           (
//             q,
//             values,
//             callback
//           ) => {

//             callback(
//               null,
//               []
//             );

//           }
//         );

//         const res =
//           await request(app)

//             .post(
//               "/api/auth/login"
//             )

//             .send({
//               email:
//                 "missing@test.com",
//               password:
//                 "password123",
//             });

//         expect(
//           res.statusCode
//         ).toBe(404);

//       }
//     );

//   }
// );