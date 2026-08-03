import { jest } from "@jest/globals";

const {
  verifyAdmin,
} = await import(
  "../../middleware/adminMiddleware.js"
);

describe(
  "verifyAdmin Middleware",
  () => {

    test(
      "should allow admin user",
      () => {

        const req = {
          userInfo: {
            isAdmin: true,
          },
        };

        const res = {};

        const next =
          jest.fn();

        verifyAdmin(
          req,
          res,
          next
        );

        expect(
          next
        ).toHaveBeenCalledWith();

      }
    );

    test(
      "should reject non-admin user",
      () => {

        const req = {
          userInfo: {
            isAdmin: false,
          },
        };

        const res = {};

        const next =
          jest.fn();

        verifyAdmin(
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
      "should reject missing userInfo",
      () => {

        const req = {};

        const res = {};

        const next =
          jest.fn();

        verifyAdmin(
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

  }
);