// apps/postRoutes.mjs
import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import protectUser from "../middlewares/protectUser.mjs";
import multer from "multer";
import supabase, { isSupabaseConfigured } from "../utils/supabase.mjs";
const settingRouter = Router();

const multerUpload = multer({ storage: multer.memoryStorage() });

const imageFileUpload = multerUpload.fields([
  { name: "imageFile", maxCount: 1 },
]);

settingRouter.put("/profile", [imageFileUpload, protectUser], async (req, res) => {
  try {
    const { name, username } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    let profilePicUrl = null;

    const file = req.files?.imageFile?.[0];
    if (file) {
      const bucketName = "user";
      const filePath = `profile/${userId}_${Date.now()}_${file.originalname}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });

      if (error) throw error;

      profilePicUrl = supabase.storage.from(bucketName).getPublicUrl(data.path).data.publicUrl;
    }

    const query = `
      UPDATE users
      SET
        name = COALESCE($1, name),
        username = COALESCE($2, username),
        profile_pic = COALESCE($3, profile_pic)
      WHERE id = $4
      RETURNING id, name, username, role, profile_pic AS "profilePic"
    `;
    const values = [name || null, username || null, profilePicUrl, userId];
    const result = await connectionPool.query(query, values);

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server could not update profile", error: err.message });
  }
});

settingRouter.patch("/reset-password", protectUser, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!isSupabaseConfigured) {
    return res.status(500).json({ error: "Server configuration error" });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      error: "Old password and new password are required"
    });
  }
  try {
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: oldPassword,
    });
    if (loginError) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({
      message: "Password updated successfully"
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default settingRouter;