import request from "supertest";
import { jest } from "@jest/globals";

const { default: app } =
  await import("../../app.js");

describe(
  "Logout Controller",
  () => {

    test(
      "should logout user",
      async () => {

        const res =
          await request(app)
            .post(
              "/api/auth/logout"
            );

        expect(
          res.statusCode
        ).toBe(200);

        expect(
          res.body
        ).toBe(
          "User has been logged out."
        );

      }
    );

  }
);