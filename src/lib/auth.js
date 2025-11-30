import jwt from "jsonwebtoken";

export function verifyToken(token) {
  try {
    console.log("verify token called with token:", token,"jwt secret:",process.env.JWT_SECRET);

    return jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET env me hona chahiye
  } catch (error) {
    return null;
  }
}
