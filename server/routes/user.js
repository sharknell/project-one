// AuthController.js (Express)

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 사용자 정보 수정
router.put("/api/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, password } = req.body;

    // 유저 찾기
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // 정보 수정
    user.email = email || user.email;
    user.username = username || user.username;
    if (password) {
      user.password = password; // 비밀번호 암호화는 별도의 처리가 필요함
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating user data");
  }
});

module.exports = router;
