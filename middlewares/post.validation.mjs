export const validationPostData = (req, res, next) => {
    const { title, image, category_id, description, content, status_id } = req.body;

    /* ================= Type Validation ================= */
    if (typeof title !== "string") {
        return res.status(400).json({
            message: "Title must be a string."
        })
    }

    if (typeof image !== "string") {
        return res.status(400).json({
            message: "image must be a string."
        })
    }

    if (typeof category_id !== "number") {
        return res.status(400).json({
            message: "category_id must be a number."
        })
    }

    if (typeof description !== "string") {
        return res.status(400).json({
            message: "description must be a string."
        })
    }

    if (typeof content !== "string") {
        return res.status(400).json({
            message: "content must be a string."
        })
    }

    if (typeof status_id !== "number") {
        return res.status(400).json({
            message: "status_id must be a number."
        })
    }

    /* ================= Required Field Validation ================= */
    if (!title.trim()) {
        return res.status(400).json({
            message: "Title is required.",
        })
    }

    if (!image.trim()) {
        return res.status(400).json({
            message: "Image is required."
        })
    }

    if (!category_id) {
        return res.status(400).json({
            message: "Category ID is required."
        })
    }

    if (!description) {
        return res.status(400).json({
            message: "Description is required."
        })
    }

    if (!content) {
        return res.status(400).json({
            message: "Content is required."
        })
    }

    if (!status_id) {
        return res.status(400).json({
            message: "Status ID is required."
        })
    }

    next();
}

