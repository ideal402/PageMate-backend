const authController = {};
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SECRET_KEY = process.env.SECRET_KEY;
const User = require("../models/User");
const axios =require("axios")

authController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("이메일 혹은 비밀번호를 확인해주세요");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("이메일 혹은 비밀번호를 확인해주세요");
    }

    const token = await user.generateToken();

    res.status(200).json({ status: "success", user, token });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email: email });
    if (user === null) {
      const randomPassword = generateRandomPassword(10);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({ email: email, password: newPassword, name: name });
      await user.save();
    }

    const sessionToken = await user.generateToken();

    res.status(200).json({ status: "success", user, sessionToken });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.loginWithKakao = async (req, res) => {
  try {
    const { code } = req.body;
    const response = await axios.post("https://kauth.kakao.com/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_REST_API_KEY,
        redirect_uri: process.env.KAKAO_REDIRECT_URI, // Kakao 콘솔에 등록된 URI
        code: req.body.code, // 클라이언트에서 받은 인증 코드
      },
    });//액세스 토큰을 받아온다
    const { data } = response;
    const kakaoAccessToken = data.access_token;

    const response2 = await axios("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    });
    const kakaoUser = response2.data;
    
    const id = kakaoUser.id
    const email = id+"@kakao.com"
    const { nickname,thumbnail_image } = kakaoUser.properties;

    let user = await User.findOne({ email: email });
    if (user === null) {
      const randomPassword = generateRandomPassword(10);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({ email: email, password: newPassword, name: nickname, profilePhoto:thumbnail_image });
      await user.save();
    }

    const sessionToken = await user.generateToken();

    res.status(200).json({ status: "success", user, sessionToken });
  } catch (error) {
    console.error("Kakao Token Request Error:", error.response?.data || error.message);
    res.status(400).json({ status: "fail", error: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error("토큰을 찾지 못하였습니다.");
    }

    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, SECRET_KEY, (error, payload) => {
      if (error) {
        throw new Error("잘못된 토큰입니다.");
      }
      req.userId = payload._id;
    });

    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

function generateRandomPassword(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }

  return password;
}

module.exports = authController;
