// import { createClient }
// from "redis";

// const redisClient =
//   createClient({
//     url:
//       process.env.REDIS_URL
//   });

// redisClient.on(
//   "error",
//   (err) => {
//     console.error(
//       "Redis Error:",
//       err
//     );
//   }
// );

// await redisClient.connect();

// export default redisClient;






// import { createClient }
// from "redis";

// const redisClient =
//   createClient({
//     url:
//       process.env.REDIS_URL,

//     socket: {
//       reconnectStrategy: false
//     }
//   });

// redisClient.on(
//   "error",
//   (err) => {

//     console.log(
//       "Redis unavailable"
//     );

//   }
// );





















// import Redis
// from "ioredis";

// export const redis =
//   new Redis();