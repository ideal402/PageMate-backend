const postController = {};
const Post = require("../models/Post");

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

module.exports = postController;