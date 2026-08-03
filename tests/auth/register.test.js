import request from "supertest";
import app from "../../app.js";

describe("Auth Register", () => {

  test(
    "should reject empty registration",
    async () => {

      const res =
        await request(app)

          .post(
            "/api/auth/register"
          )

          .send({});

      expect(
        res.statusCode
      ).toBeGreaterThanOrEqual(
        400
      );

    }
  );

});