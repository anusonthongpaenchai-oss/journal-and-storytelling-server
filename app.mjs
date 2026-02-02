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

// Root endpoint (API entry point)
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

// Swagger documentation
app.get("/api-docs", (req, res) => {
    res.send(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>API Docs</title>
      <link
        rel="stylesheet"
        href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
      />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          SwaggerUIBundle({
            url: "/swagger.json",
            dom_id: "#swagger-ui",
          });
        };
      </script>
    </body>
  </html>
    `);
});

app.get("/swagger.json", (req, res) => {
    res.json(swaggerSpec);
});

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
