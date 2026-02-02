export const validationCreatePostData = (req, res, next) => {
    const { title, image, category_id, description, content, status_id } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || !title.trim()) {
        errors.push("title is required and must be a non-empty string.");
    }
    if (!image || typeof image !== 'string' || !image.trim()) {
        errors.push("image is required and must be a non-empty string.");
    }
    if (category_id === undefined || typeof category_id !== 'number') {
        errors.push("category_id is required and must be a number.");
    }
    // description is optional

    if (!content || typeof content !== 'string' || !content.trim()) {
        errors.push("content is required and must be a non-empty string.");
    }
    if (status_id === undefined || typeof status_id !== 'number') {
        errors.push("status_id is required and must be a number.");
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Incomplete data, please provide all required fields.", errors });
    }
    next();
}

