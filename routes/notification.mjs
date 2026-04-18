import { Router } from "express";

import connectionPool, { isDbConfigured } from "../utils/db.mjs";
import protectUser from "../middlewares/protectUser.mjs";
import notificationRepository from "../repositories/notification.repository.mjs";

const notificationRouter = Router();

notificationRouter.get("/", protectUser, async (req, res) => {
  if (!isDbConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    await notificationRepository.ensureSchema();

    const { rows } = await connectionPool.query(
      `
        SELECT role
        FROM users
        WHERE id = $1
      `,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const notifications = await notificationRepository.listByRecipientId(
      req.user.id,
      rows[0].role,
      req.query.limit
    );

    return res.status(200).json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ error: "Failed to get notifications" });
  }
});

export default notificationRouter;
