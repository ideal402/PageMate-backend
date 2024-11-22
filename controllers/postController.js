const { default: mongoose } = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const postController = {};

postController.createPost = async (req, res) => {
    try {
        const { text, title, bookTitle, bookAuthor } = req.body;
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!text || !title || !bookTitle) {
            throw new Error("모든 필수 정보를 입력해 주세요.");
        }
        const newPost = new Post({
            userId,
            text,
            title,
            bookTitle,
            bookAuthor,
        });
        await newPost.save();

        const populatedPost = await Post.findById(newPost._id).populate({
            path: "userId",
            select: "name profilePhoto", 
        });
        
        res.status(200).json({ status: "success", data: populatedPost});
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};
postController.getPosts = async (req, res) => {
    try {
        const { bookTitle, page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        const cond = bookTitle
            ? { bookTitle: { $regex: bookTitle, $options: 'i' }, isDeleted: false }
            : { isDeleted: false };

        // 데이터베이스에서 조건에 맞는 게시글 검색
        const posts = await Post.find(cond)
            .sort({ createdAt: -1 }) // 최신순 정렬
            .skip((pageNumber - 1) * limitNumber) // 페이지 시작 위치
            .limit(limitNumber) // 한 페이지에 보여줄 개수
            .populate({
                path: 'userId', 
                select: 'name profilePhoto', 
            })
            .populate({
                path: 'comments', // comments 필드에 대해 populate 수행
                match: { isDeleted: false }, // 댓글 중 isDeleted가 false인 것만 포함
                select: '-__v', // 필요시 특정 필드 제외
            });
            console.log(posts)
            const formattedPosts = posts.map(post => ({
                _id: post._id,
                id: post._id,
                userId: post.userId, // 작성자 ID
                bookTitle: post.bookTitle,
                bookAuthor: post.bookAuthor,
                title: post.title,
                text: post.text,
                date: post.createdAt, // 작성 시간
                name: post.userId?.name, 
                profilePhoto: post.userId?.profilePhoto, 
                likes: post.likes,
                comments: post.comments,
                likeCount: post.likes.length,
                liked: false, // 이 필드는 프론트엔드에서 처리
            }));

        const totalPosts = await Post.countDocuments(cond); // 조건에 맞는 전체 게시글 수
        const hasMore = pageNumber * limitNumber < totalPosts; // 다음 데이터가 있는지 확인

        res.status(200).json({
            status: 'success',
            data: formattedPosts,
            pagination: {
                totalPosts,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalPosts / limitNumber),
                hasMore,
            },
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(400).json({ status: 'fail', error: error.message });
    }
};

postController.updatePost = async(req,res) => {
    try {
        const postId = req.params.id;
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
        await Post.findByIdAndUpdate(postId,{isDeleted: true},{new: true});
        res.status(200).json({status: "success", data: { id: postId } })
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
        let liked;
        if (post.likes.includes(userId)) {
            // 좋아요 취소: likes 배열에서 해당 userId를 제거
            await Post.updateOne(
                { _id: postId },
                { $pull: { likes: userId } }  
            );
            liked = false;
        } else {
            // 좋아요 추가: likes 배열에 userId를 추가
            await Post.updateOne(
                { _id: postId },
                { $push: { likes: userId } } 
            );
            liked = true;
        }
        // 게시글을 다시 조회하여 최신 상태로 반환
        const updatedPost = await Post.findById(postId)
            .populate({
                path: "userId",
                select: "name profilePhoto",
            })
            .select("-__v"); // 필요없는 필드 제거

        res.status(200).json({
            status: "success",
            data: {
                ...updatedPost.toObject(),
                liked,
                likeCount: updatedPost.likes.length,
            },
        });

    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message });
    }
};
postController.getMyPosts = async (req, res) => {
    try {
        const userId = req.userId

        // const objectId = new mongoose.Types.ObjectId(userId)

        const posts = await Post.find({ userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .populate({
                path: "userId",
                select: "name profilePhoto", 
            });

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
