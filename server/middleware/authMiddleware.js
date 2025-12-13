import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware to check if user is shelter
export const requireShelter = (req, res, next) => {
    if (req.user?.type !== "shelter") {
        return res.status(403).json({ message: "Access denied. Shelter only." });
    }
    next();
};

// Middleware to check if user is adopter
export const requireAdopter = (req, res, next) => {
    if (req.user?.type !== "adopter") {
        return res.status(403).json({ message: "Access denied. Adopter only." });
    }
    next();
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
    if (req.user?.type !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
};