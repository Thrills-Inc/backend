import logger
from "../utils/logger.js";

export const errorHandler = (
  err,
  req,
  res,
  next
) => {

  const statusCode =
    err.statusCode || 500;

  const message =
    err.message ||
    "Internal Server Error";

  logger.error({

    message,

    statusCode,

    method:
      req.method,

    url:
      req.originalUrl,

    ip:
      req.ip,

    stack:
      err.stack,

  });

  return res
    .status(statusCode)
    .json({

      success: false,

      message,

      statusCode,

    });

};






















// import logger
// from "../utils/logger.js";

// const errorHandler = (
//   err,
//   req,
//   res,
//   next
// ) => {

//   const statusCode =
//     err.statusCode || 500;

//   const message =
//     err.message ||
//     "Internal Server Error";

//   // LOGGER
//   logger.error(
//     `${statusCode} - ${message}`
//   );

//   return res
//     .status(statusCode)
//     .json({

//       success: false,

//       statusCode,

//       message,

//       stack:
//         process.env.NODE_ENV ===
//         "development"

//           ? err.stack

//           : undefined,

//     });

// };

// export {
//   errorHandler,
// };




























// export const errorHandler = (
//   err,
//   req,
//   res,
//   next
// ) => {

//   console.error(err);

//   const status =
//     err.status || 500;

//   const message =
//     err.message ||
//     "Internal Server Error";

//   return res.status(status).json({
//     success: false,
//     status,
//     message,
//   });

// };