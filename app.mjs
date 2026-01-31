import express from "express";
import cors from "cors"

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get("/profiles", (req, res) => {
    try {
        return res.status(200).json({
            "data":  {
                "name": "john",
                "age": 20
            }
          })
    } catch (err) {
        return res.status(500).json({
            message: "Server could not read post because database issue"
        })
    } 
})

app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})