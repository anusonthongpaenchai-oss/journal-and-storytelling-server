import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Journal & Storytelling API",
      version: "1.0.0",
      description: "API documentation",
    },

    servers: [
      {
        url: "/",
        description: "Base path",
      },
    ],
  },

  apis: ["./routes/*.mjs"],
};

export const swaggerSpec = swaggerJSDoc(options);
