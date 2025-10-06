// src/middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SWE4103_DEV_ONLY";

function requireAuth(req, res, next) {
  const token = req.header("authtoken") || "";
  
  if (!token) return res.status(401).json({ message: "Invalid Token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET); // { id, email, iat, exp }
    req.user = { id: payload.id, email: payload.email };

    
    return next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token"+e.message });
  }
}

module.exports = { requireAuth };
