import request from "supertest";
import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

jest.unstable_mockModule(
  "../../connect.js",
  () => ({
    db: {
      query: jest.fn(),
    },
  })
);

jest.unstable_mockModule(
  "../../utils/activityLogger.js",
  () => ({
    logActivity:
      jest.fn(),
  })
);

const { db } =
  await import("../../connect.js");

const {
  logActivity,
} = await import(
  "../../utils/activityLogger.js"
);

const { default: app } =
  await import("../../app.js");

describe(
  "Add Story Controller",
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
      "should create story successfully",
      async () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(
              null,
              {
                insertId: 99,
              }
            );

          }
        );

        const res =
          await request(app)
            .post(
              "/api/stories"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              img:
                "story.jpg",
            });

        expect(
          res.statusCode
        ).toBe(201);

        expect(
          res.body.message
        ).toBe(
          "Story has been created."
        );

        expect(
          res.body.storyId
        ).toBe(99);

        expect(
          logActivity
        ).toHaveBeenCalled();

      }
    );

    test(
      "should return 400 when image is missing",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/stories"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({});

        expect(
          res.statusCode
        ).toBe(400);

        expect(
          res.body.message
        ).toBe(
          "Story image is required."
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
            .post(
              "/api/stories"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )
            .send({
              img:
                "story.jpg",
            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);