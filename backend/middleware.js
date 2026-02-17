import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("No Authorization header");
    return res.status(401).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  console.log("Token received:", token);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT VERIFY ERROR:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    console.log("Decoded user:", decoded);
    // Attach the verified identity to this request
    req.user = decoded;
    next();
  });
};

