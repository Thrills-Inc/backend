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
  "Get Relationships Controller",
  () => {

    test(
      "should get relationships",
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
                  followerUserId: 1,
                },
                {
                  followerUserId: 2,
                },
              ]
            );

          }
        );

        const res =
          await request(app)
            .get(
              "/api/relationships?followedUserId=3"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toEqual(
          [1, 2]
        );

      }
    );
// }
// );

    test(
      "should handle database error",
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
              "/api/relationships?followedUserId=3"
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );
}
);

