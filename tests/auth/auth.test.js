import request from "supertest";
import app from "../../app.js";

describe("Auth API", () => {

  test("GET health check", async () => {

    const res =
      await request(app)
        .get("/");

    expect(
      res.statusCode
    ).toBe(200);

  });

});




















// import request from "supertest";
// import app from "../../app.js";

// describe("Auth API", () => {

//   test("Jest is working", () => {

//     expect(1 + 1).toBe(2);

//   });

// });


// import fs from "fs";

// test("app exists", () => {

//   expect(
//     fs.existsSync("./app.js")
//   ).toBe(true);

// });




















// import request
// from "supertest";

// import app
// from "../../app.js";

// describe(
//   "Auth API",

//   () => {

//     test(
//       "POST /api/auth/login should reject invalid credentials",

//       async () => {

//         const res =
//           await request(app)

//             .post(
//               "/api/auth/login"
//             )

//             .send({

//               email:
//                 "fake@test.com",

//               password:
//                 "wrongpassword",

//             });

//         expect(
//           res.statusCode
//         ).toBeGreaterThanOrEqual(
//           400
//         );

//       }

//     );

//   }
// );































// // describe("Auth", () => {

// //   test("Jest is working", () => {

// //     expect(1 + 1).toBe(2);

// //   });

// // });
