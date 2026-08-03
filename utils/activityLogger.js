import { db } from "../connect.js";
import moment from "moment";

export const logActivity = (
  userId,
  action,
  postId
) => {

  const q = `
    INSERT INTO activity_log
    (userId, postId, action, createdAt)
    VALUES (?)
  `;

  const values = [
    userId,
    postId,
    action,
    moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
  ];

  db.query(q, [values], (err) => {
    if (err) console.log(err);
  });
};