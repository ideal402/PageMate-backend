const Post = require("../models/Post");
const postController = {};

postController.createPost = async (req,res) => {
    try {
        const { text, title, bookTitle } = req.body;
        const userId = req.userId;

        if(!text || !title || !bookTitle ) {
            throw new Error("내용을 입력해 주세요.");
        }
        const newPost = new Post({
            userId,
            text,
            bookTitle: bookTitle,
            title: title,
        })
        await newPost.save()

        res.status(200).json({status: "success", data: newPost});
    } catch (error) {
        res.status(400).json({status: "fail", error: error.message});
    }
};

module.exports = postController;