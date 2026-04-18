import { Router } from "express";
import multer from "multer";

import { validationPostData } from "../middlewares/post.validation.mjs";
import protectAdmin from "../middlewares/protectAdmin.mjs";
import protectUser from "../middlewares/protectUser.mjs";
import postController from "../controllers/post.controller.mjs";
import supabase, { isSupabaseConfigured } from "../utils/supabase.mjs";

/* ================= Post Router ================= */
// Responsibility: handle post-related API endpoints

const postsRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

function imageFileUpload(req, res, next) {
  const handler = upload.single("imageFile");

  handler(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "File size too large. Max 15MB.",
      });
    }

    return res.status(400).json({
      message: error.message || "Invalid image upload.",
    });
  });
}

function normalizePostPayload(req, res, next) {
  if (req.body?.status_id !== undefined) {
    const normalizedStatusId = Number(req.body.status_id);
    req.body.status_id = Number.isNaN(normalizedStatusId) ? req.body.status_id : normalizedStatusId;
  }

  if (req.body?.category_id !== undefined && req.body.category_id !== "") {
    const normalizedCategoryId = Number(req.body.category_id);
    req.body.category_id = Number.isNaN(normalizedCategoryId) ? req.body.category_id : normalizedCategoryId;
  }

  next();
}

async function uploadPostImageToStorage(req, res, next) {
  try {
    if (!req.file) {
      return next();
    }

    if (!isSupabaseConfigured) {
      return res.status(500).json({ message: "Server configuration error" });
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG and PNG images are allowed.",
      });
    }

    const safeOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const suffix = req.params.postId
      ? `${req.params.postId}_${Date.now()}_${safeOriginalName}`
      : `${Date.now()}_${safeOriginalName}`;
    const filePath = `post/${suffix}`;

    const { data, error } = await supabase.storage
      .from("posts")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    req.body.image = supabase.storage.from("posts").getPublicUrl(data.path).data.publicUrl;
    next();
  } catch (error) {
    console.error("Post image upload error:", error);
    return res.status(500).json({
      message: "Server could not upload post image",
      error: error.message,
    });
  }
}

/* ================= GET Endpoints ================= */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     responses:
 *       200:
 *         description: Success
 */
postsRouter.get("/", postController.getPosts);

// ===== Detail =====
postsRouter.get("/:postId", postController.getPostById);

// ===== Likes Count =====
postsRouter.get("/:postId/likes-count", postController.getLikeCount);
postsRouter.patch("/:postId/likes-count", protectUser, postController.incrementLikeCount);
postsRouter.patch("/:postId/likes-count/decrement", protectUser, postController.decrementLikeCount);

// ===== Create =====
postsRouter.post(
  "/",
  protectAdmin,
  [imageFileUpload, normalizePostPayload, uploadPostImageToStorage, validationPostData],
  postController.createPost
);

// ===== Update =====
postsRouter.put(
  "/:postId",
  protectAdmin,
  [imageFileUpload, normalizePostPayload, uploadPostImageToStorage],
  postController.updatePost
);

// ===== Delete =====
postsRouter.delete("/:postId", protectAdmin, postController.deletePost);

export default postsRouter;
