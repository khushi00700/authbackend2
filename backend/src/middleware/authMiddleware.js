import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/auth/userModel.js';

export const protect = asyncHandler(async (req, res, next) => {
    try {
        //check if user is logged in
        const token = req.cookies.token;
        if (!token) {
            //401 - unauthorized
            res.status(401).json({ message: "Not authorized, Please Login!!" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //get user data from token(exclude password)
        const user = await User.findById(decoded.id).select("-password");

        //check if user exists
        if (!user) {
            //404 - not found
            res.status(404).json({ message: "User not found" });
        }

        //set user data in req object
        req.user = user;

        next();

    } catch (error) {
        //401 - unauthorized
        res.status(401).json({ message: "Not authorized, Token failed" });
    }
});

//admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        //if user is admin, move to next middleware/controller
        next();
        return;
    }
    //if user is not admin, send 403 - forbidden
    return res.status(403).json({ message: "Not authorized as an admin" });
}); 

//creator middleware
export const creatorMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && (req.user.role === "creator" || req.user.role === "admin")) {
        //if user is creator, move to next middleware/controller
        next();
        return;
    }
    //if user is not creator, send 403 - forbidden
    return res.status(403).json({ message: "Not authorized as a creator" });
});

//verified middleware
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        //if user is verified, move to next middleware/controller
        next();
        return;
    }
    //if user is not verified, send 403 - forbidden
    return res.status(403).json({ message: "Please verify your email" });
});
