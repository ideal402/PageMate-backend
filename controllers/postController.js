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