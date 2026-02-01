import 'dotenv/config'

import express from "express";
import cors from "cors"
import connectionPool from './utils/db.mjs';

const app = express()
const port = process.env.PORT || 4001

const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://journal-and-storytelling.vercel.app",
        ],
    })
);

app.use(express.json())

app.get("/health", (req, res) => {
    res.status(200).json({ message: "OK" });
});

app.post("/posts", async (req, res) => {
    const { title, image, category_id, description, content, status_id } = req.body

    if (!title || !category_id || !content || !status_id || !image) {
        return res.status(400).json({
            message: "Missing required fields from client",
        })
    }

    const newPost = {
        title,
        image,
        category_id,
        description,
        content,
        status_id,
    }

    try {
        await connectionPool.query(
            `insert into posts (title, image, category_id, description, content, status_id)
            values ($1, $2, $3, $4, $5, $6)`,
            [
                newPost.title,
                newPost.image,
                newPost.category_id,
                newPost.description,
                newPost.content,
                newPost.status_id,
            ]
        )
    } catch (error) {
        return res.status(500).json({
            message: "Server could not create post because database connection",
        })
    }

    return res.status(201).json({ message: "Created post successfully" })
})


app.get("/posts", async (req, res) => {
    try {
        const results = await connectionPool.query(`SELECT * from posts`);
        return res.status(200).json({
            data: results.rows,
        })
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({
            message: "Server could not fetch posts because database connection",
            error: error.message,
        })
    }
})


if (!isVercel) {
    app.listen(port, () => {
        console.log(`Server is running at ${port}`)
    })
}

export default app;
