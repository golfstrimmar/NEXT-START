import jwt from "jsonwebtoken";
import User from "./../models/User.js";
import { OAuth2Client } from "google-auth-library";
import axios from "axios"; // Добавьте импорт axios, если его нет

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default (io, socket) => {
  socket.on("googleLogin", async (data) => {
    const { token } = data;
    if (!token) {
      socket.emit("loginError", { message: "Token is required." });
      return;
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload.email;
      const userName = payload.name;
      const googleId = payload.sub;
      const avatarUrl = payload.picture || null;

      // Проверяем, существует ли пользователь
      let user = await User.findOne({ email });
      if (!user) {
        socket.emit("loginError", {
          message: "User not found. Please register first.",
        });
        return;
      }

      // Если googleId отсутствует, обновляем его
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Создаем JWT-токен
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "10h" }
      );

      console.log("<====googleLoginSuccess====>", user);
      socket.emit("googleLoginSuccess", {
        message: "Google login successful!",
        user,
        token: jwtToken,
      });
    } catch (error) {
      console.error("Google login error:", error);
      socket.emit("googleLoginError", {
        message: "Error during Google login.",
        error: error.message,
      });
    }
  });
};
