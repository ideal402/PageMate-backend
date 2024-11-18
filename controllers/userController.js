const userController = {};
const User = require("../models/User");
const bcrypt = require("bcryptjs");

userController.createUser = async (req, res) => {
  try {
    let { email, password, nickName } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      throw new Error("이미 가입된 이메일입니다.");
    }
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: newPassword, nickName });

    await newUser.save();

    res.status(200).json({ status: "success" });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

userController.getUser = async (req,res) => {
  try {
    const userId = req.userId
    
    const user = await User.findById(userId)
    if(!user){
      throw new Error("잘못된 토큰입니다.");
    }

    res.status(200).json({ status: "success", data: user });

  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
}
module.exports = userController;
