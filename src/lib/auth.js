import jwt from "jsonwebtoken";

export function verifyToken(token) {
  try {


    return jwt.verify(token, process.env.JWT_SECRET); // JWT_SECRET env me hona chahiye
  } catch (error) {
    return null;
  }
}
