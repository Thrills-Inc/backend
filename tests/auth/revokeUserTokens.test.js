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
  revokeUserTokens,
} = await import(
  "../../controllers/auth.js"
);

describe(
  "revokeUserTokens",
  () => {

    test(
      "should delete all refresh tokens for a user",
      () => {

        revokeUserTokens(1);

        expect(
          db.query
        ).toHaveBeenCalledWith(
          `
    DELETE FROM refresh_tokens

    WHERE userId = ?
    `,
          [1]
        );

      }
    );

  }
);