import "dotenv/config";

import express from "express";
import cors from "cors";

import { swaggerSpec } from "./swagger.mjs";
import postsRouter from "./routes/posts.mjs";

/* ================= App Setup ================= */

const app = express();
const port = process.env.PORT || 4001;

// Detect Vercel environment (serverless)
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

/* ================= Middleware ================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://journal-and-storytelling.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

/* ================= Routes ================= */

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    service: "Journal & Storytelling API",
    status: "running",
    docs: "/api-docs",
    health: "/health",
  });
});

// API routes
app.use(postsRouter);

/* ================= Swagger ================= */

app.get("/api-docs", (req, res) => {
  // IMPORTANT: handle proxy / Vercel correctly
  const protocol =
    req.headers["x-forwarded-proto"] || req.protocol;

  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;

  res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Journal & Storytelling API Docs</title>

    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>

    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: "${baseUrl}/swagger.json",
          dom_id: "#swagger-ui",
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset,
          ],
          layout: "StandaloneLayout",
        });
      };
    </script>
  </body>
</html>
  `);
});

// Swagger JSON
app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

/* ================= Health Check ================= */

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

/* ================= Server ================= */

// IMPORTANT:
// - Vercel = export app only
// - Local = listen normally
if (!isVercel) {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
}

export default app;
