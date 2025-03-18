import User from "./../models/User.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export default (io, socket) => {
  socket.on("googleRegister", async (data) => {
    const { token } = data;
    if (!token) {
      socket.emit("registrationError", { message: "Token is required." });
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
      let user = await User.findOne({ email });
      if (user) {
        if (!user.googleId) {
          user.googleId = googleId;
          await user.save();
        }
        console.log("<====googleRegisterSuccess====>", user);
        socket.emit("googleRegisterSuccess", {
          message: "User already exists. Account linked with Google.",
          user,
        });
        return;
      }
      socket.emit("requirePassword", {
        message: "You need to set a password to complete registration.",
        email,
        userName,
        googleId,
        avatarUrl,
      });
    } catch (error) {
      console.error("Google registration error:", error);
      socket.emit("registrationError", {
        message: "Error during Google registration.",
      });
    }
  });
};
