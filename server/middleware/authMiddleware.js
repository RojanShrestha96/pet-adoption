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
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        console.error("Token verification error:", error);
        return res.status(401).json({ message: "Invalid token" });
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

// Middleware to check if user is super_admin
export const requireSuperAdmin = (req, res, next) => {
    // Check if user is admin and has role of super_admin
    // Note: req.user is populated by verifyToken middleware
    if (req.user?.type !== "admin" || req.user?.role !== "super_admin") {
        return res.status(403).json({ message: "Access denied. Super Admin only." });
    }
    next();
};