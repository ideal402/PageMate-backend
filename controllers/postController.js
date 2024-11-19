const Post = require("../models/Post");
const User = require("../models/User");
const postController = {};

postController.createPost = async (req, res) => {
    try {
        const { text, title, bookTitle, bookAuthor } = req.body;
        const userId = req.userId;

        if (!text || !title || !bookTitle) {
            throw new Error("모든 필수 정보를 입력해 주세요.");
        }
        const user = await User.findById(userId);

        const newPost = new Post({
            userId,
            text,
            title,
            bookTitle,
            bookAuthor,
            author: user.nickName
        });
        
        await newPost.save();

        res.status(200).json({ status: "success", data: newPost });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
postController.getPosts = async(req,res) => {
    try {
        const {bookTitle} = req.query;
        const cond = bookTitle
        ? {bookTitle: {$regex:bookTitle, $options:'i'}, isDeleted: false}
        : {isDeleted: false};
        
        // 데이터베이스에서 조건에 맞는 게시글 검색
        const posts = await Post.find(cond).sort({ createdAt: -1 }); // 최신순 정렬

        res.status(200).json({status: 'success', data: posts});
    } catch (error) {
        console.log('Error fetching posts:',error);
        res.status(400).json({status: 'fail', error: error.message});
    }
}
postController.updatePost = async(req,res) => {
    try {
        console.log("req.params:", req);
        const postId = req.params.id;
        console.log("postId:", postId);
        const userId = req.userId;
        const update = req.body;
        const post = await Post.findById(postId);
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ status: "fail", error: "본인 게시글만 수정이 가능합니다." });
        }
        const updatePost = await Post.findByIdAndUpdate(postId, update, {new:true})
        res.status(200).json({ status: "success", data: updatePost });
    } catch (error) {
        res.status(400).json({status: 'fail', error: error.message});
    }
}
postController.deletePost = async(req,res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const post = await Post.findById(postId);
        if (post.userId.toString() !== userId) {
            return res.status(403).json({ status: "fail", error: "본인 게시글만 삭제가 가능합니다." });
        }
        const del = await Post.findByIdAndUpdate({_id: postId},{isDeleted: true},{new: true});
        res.status(200).json({status: "success", data: del})
    } catch (error) {
        res.status(400).json({status: 'fail', error: error.message});
    }
}
module.exports = postController;
