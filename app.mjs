import 'dotenv/config'

import express from "express";
import cors from "cors"
import connectionPool from './utils/db.mjs';

const app = express()
const port = process.env.PORT || 4001

app.use(cors())
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

    let results;

    try {
        results = await connectionPool.query(`SELECT * from posts`);
    } catch (error) {
        res.status(500).json({
            message: "Server could not create post because database connection",
            error: error.message,
        })
    }

    return res.status(200).json({
        data: results.rows,
    })
})


app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})
