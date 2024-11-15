const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    nickName: { type: String, required: true },
    profilePhoto: { type: String, default:""},
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
