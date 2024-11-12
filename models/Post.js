const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    commentText: { type: String, required: true },
    commentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const postSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    img: { type: String },
    likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    comments: { type: [commentSchema], default: [] },
    bookTitle: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
