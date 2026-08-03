import request from "supertest";
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
  "Search Users Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should return users successfully",
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
                  name: "John Doe",
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/search/users?q=john"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body.length
        ).toBe(1);

        expect(
          res.body[0].username
        ).toBe("john");

      }
    );

    test(
      "should return 400 when query missing",
      async () => {

        const res =
          await request(app)
            .get(
              "/api/search/users"
            );

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "Search query is required."
        );

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

        const res =
          await request(app)
            .get(
              "/api/search/users?q=john"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);