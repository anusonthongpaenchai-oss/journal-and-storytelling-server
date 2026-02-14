import "dotenv/config";

import express from "express";
import cors from "cors";

import { swaggerSpec } from "./swagger.mjs";

/* ================= Router ================= */
import postsRouter from "./routes/post.mjs";
import authRouter from "./routes/auth.mjs";
import settingRouter from "./routes/setting.mjs";

/* ================= App ================= */
const app = express();
const port = process.env.PORT || 4001;
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
app.use("/posts", postsRouter);
app.use("/auth", authRouter);
app.use("/setting", settingRouter)

/* ================= Swagger Documentation ================= */
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>

    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: "/swagger.json",
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

// Swagger JSON endpoint
app.get("/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});

/* ================= Health Check ================= */
app.get("/health", (req, res) => {
  res.json({ message: "OK" });
});

/* ================= Server Initialization ================= */
if (!isVercel) {
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
}

export default app;
