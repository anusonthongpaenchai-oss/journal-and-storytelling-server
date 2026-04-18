export const validationPostData = (req, res, next) => {
    const { title, image, category_id, category, description, content, status_id } = req.body;
    const hasUploadedImage = Boolean(req.file);

    /* ================= Type Validation ================= */
    if (typeof title !== "string") {
        return res.status(400).json({
            message: "Title must be a string."
        })
    }

    if (!hasUploadedImage && typeof image !== "string") {
        return res.status(400).json({
            message: "image must be a string."
        })
    }

    if (category_id !== undefined && typeof category_id !== "number") {
        return res.status(400).json({
            message: "category_id must be a number."
        })
    }

    if (category !== undefined && typeof category !== "string") {
        return res.status(400).json({
            message: "category must be a string."
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

    if (!hasUploadedImage && !image?.trim()) {
        return res.status(400).json({
            message: "Image is required."
        })
    }

    if (!category_id && !(typeof category === "string" && category.trim())) {
        return res.status(400).json({
            message: "Category or Category ID is required."
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

