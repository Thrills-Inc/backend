import { jest } from "@jest/globals";

const {
  errorHandler,
} = await import(
  "../../middleware/errorHandler.js"
);

describe(
  "errorHandler Middleware",
  () => {

    test(
      "should return provided status code and message",
      () => {

        const err = {
          statusCode: 404,
          message: "Not found",
          stack: "test stack",
        };

        const req = {
          method: "GET",
          originalUrl: "/test",
          ip: "127.0.0.1",
        };

        const json =
          jest.fn();

        const status =
          jest.fn(
            () => ({
              json,
            })
          );

        const res = {
          status,
        };

        errorHandler(
          err,
          req,
          res,
          jest.fn()
        );

        expect(
          status
        ).toHaveBeenCalledWith(
          404
        );

        expect(
          json
        ).toHaveBeenCalledWith({
          success: false,
          message: "Not found",
          statusCode: 404,
        });

      }
    );

    test(
      "should use default values when missing",
      () => {

        const err = {};

        const req = {
          method: "GET",
          originalUrl: "/test",
          ip: "127.0.0.1",
        };

        const json =
          jest.fn();

        const status =
          jest.fn(
            () => ({
              json,
            })
          );

        const res = {
          status,
        };

        errorHandler(
          err,
          req,
          res,
          jest.fn()
        );

        expect(
          status
        ).toHaveBeenCalledWith(
          500
        );

        expect(
          json
        ).toHaveBeenCalledWith({
          success: false,
          message:
            "Internal Server Error",
          statusCode: 500,
        });

      }
    );

  }
);