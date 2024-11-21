const Comment = require("../models/Comment");
const Post = require("../models/Post");
const mongoose = require("mongoose");

const commentController = {};

// 댓글 추가
commentController.addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const userId = req.userId;
  
    // 필수 필드 확인
    if (!postId || !text) {
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
      commentText: text,
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

// 댓글 가져오기
commentController.fetchComments = async (req, res) => {
  try {
    const { postId } = req.params;

     // 문자열을 ObjectId로 변환
     if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        status: "fail",
        error: "Invalid postId format",
      });
    }
    
    // Post 존재 여부 확인
    const postExists = await Post.findById(postId);
    if (!postExists) {
      return res.status(404).json({
        status: "fail",
        error: "Post not found.",
      });
    }

    // isDeleted가 false인 댓글만 가져오기
    const comments = await Comment.find({ 
      _id: { $in: postExists.comments }, 
      isDeleted: false, 
    })
    .populate({ path: "userId", select: "name profilePhoto" })
    .exec();

    // name 값을 author로 매핑하여 데이터 가공
    const formattedComments = comments.map((comment) => ({
      _id: comment._id,
      postId: comment.postId,
      userId: comment.userId._id,
      author: comment.userId.name, // userId.name을 author로 매핑
      profilePhoto: comment.userId.profilePhoto,
      commentText: comment.commentText,
      commentDate: comment.commentDate,
      isDeleted: comment.isDeleted,
      createdAt: comment.createdAt,
    }));

    res.status(200).json({
      status: "success",
      data: formattedComments,
    });
  } catch (error) {
    // 에러 처리
    res.status(500).json({
      status: "fail",
      error: error.message,
    });
  }
};

// 댓글 삭제
commentController.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // 문자열을 ObjectId로 변환
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        status: "fail",
        error: "Invalid commentId format",
      });
    }

    // 댓글 찾기 및 isDeleted를 true로 설정
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isDeleted: true },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        status: "fail",
        error: "Comment not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Comment successfully deleted",
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