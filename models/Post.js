const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    title: { type: String, required: true},
    // img: { type: String },
    likes: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    comments: {
      type: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
      default: [],
    },
    bookTitle: { type: String, required: true},
    bookAuthor: { type: String, required: true},
    author: {type: String},
    isDeleted: { type: Boolean, default: "false" }
  },
  { timestamps: true }
);

postSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;

  return obj;
};

module.exports = mongoose.model("Post", postSchema);