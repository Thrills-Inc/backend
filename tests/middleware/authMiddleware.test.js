import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET =
  "test-secret";

const {
  verifyToken,
} = await import(
  "../../middleware/authMiddleware.js"
);

describe(
  "verifyToken Middleware",
  () => {

    test(
      "should reject request without token",
      () => {

        const req = {
          cookies: {},
        };

        const res = {};

        const next =
          jest.fn();

        verifyToken(
          req,
          res,
          next
        );

        expect(
          next
        ).toHaveBeenCalled();

        const error =
          next.mock.calls[0][0];

        expect(
          error.statusCode
        ).toBe(401);

      }
    );

    test(
      "should reject invalid token",
      () => {

        const req = {
          cookies: {
            accessToken:
              "invalid-token",
          },
        };

        const res = {};

        const next =
          jest.fn();

        verifyToken(
          req,
          res,
          next
        );

        const error =
          next.mock.calls[0][0];

        expect(
          error.statusCode
        ).toBe(403);

      }
    );

    test(
      "should allow valid token",
      () => {

        const token =
          jwt.sign(
            { id: 1 },
            process.env.JWT_SECRET
          );

        const req = {
          cookies: {
            accessToken:
              token,
          },
        };

        const res = {};

        const next =
          jest.fn();

        verifyToken(
          req,
          res,
          next
        );

        expect(
          req.userInfo.id
        ).toBe(1);

        expect(
          next
        ).toHaveBeenCalledWith();

      }
    );

  }
);