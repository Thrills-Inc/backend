import { db } from "../connect.js";

import logger
from "../utils/logger.js";

import ApiError
from "../utils/ApiError.js";

import {
  logActivity,
} from "../utils/activityLogger.js";


export const blockUser = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const blockedId =
    req.body.blockedId;

  if (
    userInfo.id === blockedId
  ) {

    return next(
      new ApiError(
        400,
        "You cannot block yourself."
      )
    );

  }

  const q = `
    INSERT INTO blocked_users
    (
      blockerId,
      blockedId
    )
    VALUES (?, ?)
  `;

  db.query(
    q,
    [
      userInfo.id,
      blockedId,
    ],

    (err) => {

      if (err)
        return next(err);

      logActivity(
        userInfo.id,
        "block_user",
        blockedId
      );

      logger.info(
        `User ${userInfo.id} blocked user ${blockedId}`
      );

      return res
        .status(200)
        .json(
          "User blocked."
        );

    }
  );

};

export const unblockUser = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    DELETE FROM blocked_users

    WHERE

      blockerId = ?

      AND

      blockedId = ?
  `;

  db.query(
    q,
    [
      userInfo.id,
      req.params.id,
    ],

    (err) => {

      if (err)
        return next(err);

      logger.info(
        `User ${userInfo.id} unblocked ${req.params.id}`
      );

      return res
        .status(200)
        .json(
          "User unblocked."
        );

    }
  );

};

export const getBlockedUsers = (
  req,
  res,
  next
) => {

  const userInfo =
    req.userInfo;

  const q = `
    SELECT

      u.id,

      u.name,

      u.username,

      u.profilePic

    FROM blocked_users b

    JOIN users u
    ON u.id = b.blockedId

    WHERE
      b.blockerId = ?
  `;

  db.query(
    q,
    [userInfo.id],

    (err,data) => {

      if(err)
        return next(err);

      return res
        .status(200)
        .json(data);

    }
  );

};

