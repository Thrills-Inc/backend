import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

jest.unstable_mockModule(
  "../../utils/activityLogger.js",
  () => ({
    logActivity:
      jest.fn(),
  })
);

const {
  logActivity,
} = await import(
  "../../utils/activityLogger.js"
);

const { default: app } =
  await import("../../app.js");

describe(
  "Track Hashtag Visit Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        {
          id: 1,
        },
        process.env.JWT_SECRET
      );

    });

    test(
      "should track hashtag visit successfully",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/hashtags/visit/react"
            )
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
          res.body
        ).toBe(
          "Visit tracked."
        );

        expect(
          logActivity
        ).toHaveBeenCalledWith(
          1,
          "hashtag_visit",
          "react"
        );

      }
    );

    test(
      "should return 500 when activity logger throws",
      async () => {

        logActivity.mockImplementation(
          () => {

            throw new Error(
              "Logging failed"
            );

          }
        );

        const res =
          await request(app)
            .post(
              "/api/hashtags/visit/react"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);