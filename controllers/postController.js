const { default: mongoose } = require("mongoose");
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

        const newPost = new Post({
            userId,
            text,
            title,
            bookTitle,
            bookAuthor,
            author
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
postController.likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ status: "fail", error: "로그인이 필요합니다." });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ status: "fail", error: "게시글을 찾을 수 없습니다." });
        }
        if (post.likes.includes(userId)) {
            // 좋아요 취소: likes 배열에서 해당 userId를 제거
            await Post.updateOne(
                { _id: postId },
                { $pull: { likes: userId } }  
            );
        } else {
            // 좋아요 추가: likes 배열에 userId를 추가
            await Post.updateOne(
                { _id: postId },
                { $push: { likes: userId } } 
            );
        }
        // 게시글을 다시 조회하여 최신 상태로 반환
        const updatedPost = await Post.findById(postId);
        res.status(200).json({ status: "success", data: updatedPost });

    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message });
    }
};
postController.getMyPosts = async (req, res) => {
    try {
        const userId = req.userId

        // const objectId = new mongoose.Types.ObjectId(userId)

        const posts = await Post.find({userId, isDeleted: false }).sort({ createdAt: -1 });

        res.status(200).json({status: 'success', data: posts});
    } catch (error) {
        res.status(400).json({status: 'fail', error: error.message});
    }
}

postController.getLikedPosts = async (req, res) => {
    try {
        const userId = req.userId

        const likedPosts = await Post.find({likes:userId, isDeleted: false })

        res.status(200).json({status: 'success', data: likedPosts});
    } catch (error) {
        res.status(400).json({status: 'fail', error: error.message});
    }
}

module.exports = postController;
