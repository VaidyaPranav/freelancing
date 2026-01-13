import jwt from "jsonwebtoken";

const protect = (req, res, next) => {
  // Check token from cookies first, then from Authorization header
  let token = req.cookies.token;
  
  if (!token && req.headers.authorization) {
    // Extract token from "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export default protect;
