import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for Express (ESM)",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:4001",
      },
    ],
  },
  apis: ["./routes/*.mjs", "./app.mjs"],
};

export const swaggerSpec = swaggerJSDoc(options);
