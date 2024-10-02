import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Middleware to verify the token
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Debugging: Log the Authorization header
  console.log('Authorization Header:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

  // Debugging: Log the extracted token
  console.log('Extracted Token:', token);

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admins only' });
  }
  next(); // Proceed if the user is an admin
};



const auth = (req, res, next) => {
  // Get token from the request header
  const token = req.header('Authorization').split(' ')[1]; // Extract token from 'Bearer <token>'

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Ensure JWT_SECRET is properly configured
    req.user = decoded.user;  // Extract user details from the token (contains id and role)
    next();  // Move to the next middleware/route
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};




export { verifyToken, isAdmin, auth }; // Export both functions
