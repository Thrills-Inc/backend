import {
  Worker,
} from "bullmq";

new Worker(
  "notifications",

  async (job) => {

    const {
      senderId,
      receiverId,
      type,
    } = job.data;

    // insert notification

  }

);