import rateLimit from "express-rate-limit";

// AUTH LIMITER
export const authLimiter = rateLimit({

  windowMs: 15 * 60 * 1000, // 15 mins

  max: 10,

  message:
    "Too many login attempts. Please try again later.",

  standardHeaders: true,

  legacyHeaders: false,

});

export const apiLimiter =
  rateLimit({

    windowMs:
      60 * 1000,

    max: 100,

    standardHeaders: true,

    legacyHeaders: false,

  });


  export const searchLimiter =
  rateLimit({

    windowMs:
      60 * 1000,

    max: 20,

    message: {
      message:
        "Too many searches. Slow down."
    },

  });

// COMMENT LIMITER
export const commentLimiter = rateLimit({

  windowMs: 1 * 60 * 1000, // 1 minute

  max: 30,

  message:
    "Too many comments. Slow down.",

});

// MESSAGE LIMITER
export const messageLimiter = rateLimit({

  windowMs: 1 * 60 * 1000,

  max: 40,

  message:
    "Too many messages sent.",

});

// LIKE LIMITER
export const likeLimiter = rateLimit({

  windowMs: 1 * 60 * 1000,

  max: 60,

  message:
    "Too many likes. Slow down.",

});