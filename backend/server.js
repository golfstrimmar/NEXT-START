import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import http from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { connectDB } from "./config/db.js";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";

const app = express();
connectDB();
dotenv.config();
const httpServer = createServer(app);
const io = new Server(httpServer);

const server = http.createServer(app);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==============================================

// import Article from "./models/Article.js";
// import articleHandler from "./components/articleHandler.js";
// import articleEditHandler from "./components/articleEditHandler.js";
import googleRegister from "./components/googleRegister.js";
import handlerRegister from "./components/handlerRegister.js";
import handlerLogin from "./components/handlerLogin.js";
import googleLogin from "./components/googleLogin.js";
import handlerSetPassword from "./components/handlerSetPassword.js";
import User from "./models/User.js";

// ==============================================

app.get("/", (req, res) => {
  res.send("Start Backend");
});
// ----------------------------
app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Code is required");
  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:5001/auth/google/callback",
      grant_type: "authorization_code",
    });
    const { access_token, id_token } = response.data;
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const userName = payload.name;
    const googleId = payload.sub;
    const avatarUrl = payload.picture || null;
    let user = await User.findOne({ email });
    if (!user) {
      const avatarBase64 = avatarUrl
        ? await downloadAvatarAsBase64(avatarUrl)
        : null;
      user = new User({ email, userName, avatar: avatarBase64, googleId });
      await user.save();
    }
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );
    res.redirect(`http://localhost:3000/dashboard?token=${jwtToken}`);
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).send("Authentication failed");
  }
});
const downloadAvatarAsBase64 = async (url) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return `data:image/jpeg;base64,${Buffer.from(response.data).toString(
      "base64"
    )}`;
  } catch (error) {
    console.error("Failed to download avatar:", error);
    return null;
  }
};
// ----------------------------
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  googleRegister(io, socket);
  handlerRegister(io, socket);
  handlerLogin(io, socket);
  googleLogin(io, socket);
  handlerSetPassword(io, socket);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});
const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
