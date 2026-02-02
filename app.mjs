import "dotenv/config";

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./swagger.mjs";
import postsRouter from "./routes/posts.mjs";

/* ================= App Setup ================= */

// Responsibility: initialize Express application and middleware
const app = express();
const port = process.env.PORT || 4001;

// Detect Vercel environment to avoid calling app.listen()
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

/* ================= Middleware ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://journal-and-storytelling.vercel.app",
    ],
  })
);

app.use(express.json());

/* ================= Routes ================= */

// API routes
app.use(postsRouter);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

/* ================= Server ================= */

// Start server only in non-serverless environments
if (!isVercel) {
  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}

export default app;
