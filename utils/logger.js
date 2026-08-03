import winston from "winston";

// Detect if running on Vercel or production serverless environment
const isServerless =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

// Always output to Console (Vercel automatically captures standard console logs)
const transports = [new winston.transports.Console()];

// Only enable File logging when running LOCALLY to prevent serverless mkdirSync crashes
if (!isServerless) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );
}

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),

    winston.format.errors({
      stack: true,
    }),

    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),

  transports: transports,
});

export default logger;











// import winston from "winston";

// const logger =
//   winston.createLogger({

//     level: "info",

//     format:
//       winston.format.combine(

//         winston.format.timestamp(),

//         winston.format.errors({
//           stack: true,
//         }),

//         winston.format.printf(
//           ({
//             timestamp,
//             level,
//             message,
//             stack,
//           }) => {

//             return stack

//               ? `${timestamp} [${level.toUpperCase()}] ${message}\n${stack}`

//               : `${timestamp} [${level.toUpperCase()}] ${message}`;

//           }
//         )

//       ),

//     transports: [

//       new winston.transports.Console(),

//       new winston.transports.File({
//         filename:
//           "logs/error.log",

//         level:
//           "error",
//       }),

//       new winston.transports.File({
//         filename:
//           "logs/combined.log",
//       }),

//     ],

//   });

// export default logger;































// // import winston from "winston";

// // const logger =
// //   winston.createLogger({

// //     level: "info",

// //     format:
// //       winston.format.combine(

// //         winston.format.timestamp(),

// //         winston.format.printf(
// //           ({
// //             level,
// //             message,
// //             timestamp,
// //           }) => {

// //             return `${timestamp} [${level.toUpperCase()}]: ${message}`;

// //           }
// //         )
// //       ),

// //     transports: [

// //       new winston.transports.Console(),

// //       new winston.transports.File({
// //         filename: "logs/error.log",
// //         level: "error",
// //       }),

// //       new winston.transports.File({
// //         filename: "logs/combined.log",
// //       }),

// //     ],

// //   });

// // export default logger;