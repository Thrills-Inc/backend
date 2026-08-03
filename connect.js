import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

let db = null;

if (
  process.env.NODE_ENV !== "test"
) {

  db = mysql.createConnection({

    host:
      process.env.DB_HOST,

    user:
      process.env.DB_USER,

    password:
      process.env.DB_PASSWORD,

    database:
      process.env.DB_NAME,

    port:
      process.env.DB_PORT,

  });

}

export { db };



















// import mysql from "mysql2";
// import dotenv from "dotenv";

// dotenv.config();

// export const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });


































// import mysql from "mysql2";

// export const db = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password: "Dyscalculia75",
//     database:"thrills"
// })