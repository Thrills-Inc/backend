import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../connect.js",
  () => ({
    db: {
      query: jest.fn(),
    },
  })
);

const { db } =
  await import("../../connect.js");

const {
  logAudit,
} = await import(
  "../../utils/auditLogger.js"
);

describe(
  "auditLogger",
  () => {

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test(
      "should insert audit log successfully",
      () => {

        db.query.mockImplementation(
          (
            q,
            values,
            callback
          ) => {

            callback(null);

          }
        );

        logAudit(
          1,
          "login",
          "user",
          1
        );

        expect(
          db.query
        ).toHaveBeenCalled();

      }
    );

    test(
      "should handle database error",
      () => {

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

        expect(
          () =>
            logAudit(
              1,
              "login",
              "user",
              1
            )
        ).not.toThrow();

        expect(
          db.query
        ).toHaveBeenCalled();

      }
    );

  }
);