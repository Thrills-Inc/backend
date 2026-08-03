import request from "supertest";
import app from "../../app.js";

describe("Auth Login", () => {

  test(
    "should reject empty login",
    async () => {

      const res =
        await request(app)

          .post(
            "/api/auth/login"
          )

          .send({});

      expect(
        res.statusCode
      ).toBe(400);

    }
  );

});