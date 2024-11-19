const Comment = require("../models/Comment");
const Post = require("../models/Post");

const commentController = {};

// 댓글 추가
commentController.addComment = async (req, res) => {
  try {
    const { postId, commentText } = req.body;
    const userId = req.userId;
    console.log("comment",commentText);
    console.log("postId",postId);

    // 필수 필드 확인
    if (!postId || !commentText) {
      return res.status(400).json({
        status: "fail",
        error: "postId, and commentText are required fields.",
      });
    }

    // Post가 존재하는지 확인 (Optional)
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        status: "fail",
        error: "Post not found.",
      });
    }

    // 새로운 댓글 생성
    const newComment = new Comment({
      userId,
      postId,
      commentText,
    });

    // 댓글 저장
    const savedComment = await newComment.save();

    // Post에 댓글 추가
    postExists.comments.push(savedComment._id);
    await postExists.save();

    // 응답 반환
    res.status(201).json({
      status: "success",
      data: newComment,
    });
  } catch (error) {
    // 에러 처리
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

module.exports = commentController;
