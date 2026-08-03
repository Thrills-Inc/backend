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

jest.unstable_mockModule(
  "../../utils/activityLogger.js",
  () => ({
    logActivity:
      jest.fn(),
  })
);

const { db } =
  await import("../../connect.js");

const { default: app } =
  await import("../../app.js");

describe(
  "Add Post Controller",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should create post successfully",
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
                insertId: 1,
              }
            );

          }
        );

        const res =
          await request(app)

            .post("/api/posts")

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              desc:
                "My first post",
              img:
                "image.jpg",
            });

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "Post has been created."
        );

      }
    );

    test(
      "should return 400 when post is empty",
      async () => {

        const res =
          await request(app)

            .post("/api/posts")

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              desc: "",
              img: "",
            });

        expect(
          res.statusCode
        ).toBe(400);

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

            .post("/api/posts")

            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            )

            .send({
              desc:
                "My first post",
              img:
                "image.jpg",
            });

        expect(
          res.statusCode
        ).toBe(500);

      }
    );

  }
);