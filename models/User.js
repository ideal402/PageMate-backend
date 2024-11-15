const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

const userSchema = Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    nickName: { type: String, required: true },
    profilePhoto: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;

  return obj;
};

userSchema.methods.generateToken = async function () {
  const token = await jwt.sign({ _id: this.id }, SECRET_KEY, {
    expiresIn: "6h",
  });
  return token;
};

module.exports = mongoose.model("User", userSchema);
