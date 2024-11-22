const userController = {};
const User = require("../models/User");
const bcrypt = require("bcryptjs");

userController.createUser = async (req, res) => {
  try {
    let { email, password, name } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      throw new Error("이미 가입된 이메일입니다.");
    }
    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: newPassword, name });

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

userController.deleteUser = async (req,res) => {
  try {
    const userId = req.userId
    
    if (!userId) {
      return res.status(400).json({ status: "fail", error: "User ID is missing" });
    }

    const user = await User.findByIdAndDelete(userId);

    res.status(200).json({ status: "success", data: user });

  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
}

userController.updateUserName = async (req,res) => {
  try {
    const userId = req.userId
    const {updateName} = req.body
    console.log("🚀 ~ userController.updateUserName= ~ req.body:", req.body)
    console.log("🚀 ~ userController.updateUserName= ~ updateName:", updateName)
    
    const user = await User.findByIdAndUpdate(
      userId,
      { name: updateName },
      { new: true } // 업데이트된 문서를 반환
    );

    if (!user) {
      return res.status(400).json({ status: "fail", error: "User Not found" });
    }
    
    res.status(200).json({ status: "success", data: user });

  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
}

userController.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.userId; // 인증 미들웨어에서 설정된 사용자 ID
    const { profilePhoto } = req.body; // 요청에서 새로운 프로필 사진 URL 받기

    if (!profilePhoto) {
      throw new Error("프로필 사진 URL이 제공되지 않았습니다.");
    }

    // 사용자 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePhoto },
      { new: true } // 업데이트된 사용자 데이터를 반환
    );

    if (!updatedUser) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      error: error.message,
    });
  }
};

module.exports = userController;
