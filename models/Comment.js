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

commentSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("Comment", commentSchema);