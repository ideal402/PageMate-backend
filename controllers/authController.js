const authController = {};
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
const User = require("../models/User");

authController.login = async (req,res) => {
    try {
        const {email, password} = req.body
        
        const user = await User.findOne({email:email})
        if(!user){
            throw new Error("이메일 혹은 비밀번호를 확인해주세요");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🚀 ~ authController.login= ~ isMatch:", isMatch)

        if(!isMatch){
            throw new Error("이메일 혹은 비밀번호를 확인해주세요");
        }

        const token = await user.generateToken();

        res.status(200).json({status:"success", user, token})
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });    
    }
}

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if(!tokenString){
        throw new Error("토큰을 찾지 못하였습니다.");
    }

    const token = tokenString.replace("Bearer ","");

    jwt.verify(token, SECRET_KEY, (error, payload) => {
        if(error){
            throw new Error("잘못된 토큰입니다.");
        }
        req.userId = payload._id;
    });

    next();

  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = authController;
