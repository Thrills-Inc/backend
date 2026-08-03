import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "testsecret";
  
const adminToken = jwt.sign(
  {
    id: 1,
    role: "admin",
  },
  process.env.JWT_SECRET || "testsecret"
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
  "Get Messages Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return messages successfully",
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
                  text: "Hello",
                },
                {
                  id: 2,
                  text: "Hi",
                },
              ]
            );

          }
        );

        const res = await request(app)
          .get("/api/messages/1")
          .set(
            "Authorization",
            `Bearer ${adminToken}`
          );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/messages/1"
        //     );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(2);

        expect(
          res.body.messages.length
        ).toBe(2);

      }
    );

    test(
      "should return empty messages array",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              []
            );

          }
        );

        const res = await request(app)
          .get("/api/messages/1")
          .set(
            "Authorization",
            `Bearer ${adminToken}`
          );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/messages/1"
        //     );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.results
        ).toBe(0);

        expect(
          res.body.messages
        ).toEqual([]);

      }
    );

    test(
      "should support pagination",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              []
            );

          }
        );

        const res = await request(app)
          .get("/api/messages/1?page=2&limit=5")
          .set(
            "Authorization",
            `Bearer ${adminToken}`
          );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/messages/1?page=2&limit=5"
        //     );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.page
        ).toBe(2);

        expect(
          res.body.limit
        ).toBe(5);

      }
    );

    test(
      "should return 500 when database fails",
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

        const res = await request(app)
          .get("/api/messages/1")
          .set(
            "Authorization",
            `Bearer ${adminToken}`
          );

        // const res =
        //   await request(app)
        //     .get(
        //       "/api/messages/1"
        //     );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);