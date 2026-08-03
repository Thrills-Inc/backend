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
  "../../utils/auditLogger.js",
  () => ({
    logAudit:
      jest.fn(),
  })
);

const { db } =
  await import("../../connect.js");

const {
  logAudit,
} = await import(
  "../../utils/auditLogger.js"
);

const { default: app } =
  await import("../../app.js");

describe(
  "Delete Any Comment Controller",
  () => {

    let token;

    beforeEach(() => {

      jest.clearAllMocks();

      token = jwt.sign(
        {
          id: 99,
          role: "admin",
        },
        process.env.JWT_SECRET
      );

    });

    test(
      "should delete comment successfully",
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
                affectedRows: 1,
              }
            );

          }
        );

        const res =
          await request(app)
            .delete(
              "/api/admin/comments/1"
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
          "Comment deleted."
        );

        expect(
          logAudit
        ).toHaveBeenCalled();

      }
    );

    test(
      "should return 404 when comment not found",
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
                affectedRows: 0,
              }
            );

          }
        );

        const res =
          await request(app)
            .delete(
              "/api/admin/comments/999"
            )
            .set(
              "Cookie",
              [
                `accessToken=${token}`,
              ]
            );

        expect(
          res.statusCode
        ).toBe(404);

        expect(
          res.body.message
        ).toBe(
          "Comment not found."
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
            .delete(
              "/api/admin/comments/1"
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