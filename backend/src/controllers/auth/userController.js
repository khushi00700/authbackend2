import asyncHandler from 'express-async-handler';
import User from '../../models/auth/userModel.js';
import generateToken from '../../helpers/generateToken.js';
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
        //400 - bad request
        res.status(400).json({ message: "All fields are required" });
    }

    //check password length
    if(password.length < 6){
        res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    //check if user already exists
    const userExists = await User.findOne({email})

    if(userExists){
        //400 - bad request
        res.status(400).json({ message: "User already exists" });
    }

    //create user
    const user = await User.create({
        name,
        email,
        password
    });

    //token generation
    const token = generateToken(user._id);
    
    //sending back user data and token in response to the client
    res.cookie("token", token, {
        path: '/',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, //30 day
        sameSite: true,
        secure: true
    })

    if(user){
        const { _id, name, email, role, photo, bio, isVerified } = user;
        //201 - created
        res.status(201).json({ _id, name, email, role, photo, bio, isVerified,token });
        }
        else{
            res.status(400).json({ message: "Invalid user data" });
        }
});

//user login
export const loginUser = asyncHandler(async (req, res) => {
    //get email and password from req.body
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
        //400 - bad request
        res.status(400).json({ message: "All fields are required" });
    }

    //check if user exists
    const userExists = await User.findOne({email});

    if(!userExists){
        //400 - bad request
        return res.status(404).json({ message: "User not found, Sign up!!" });
    }

    //check password match with the database password
    const isMatch = await bycrypt.compare(password, userExists.password);

    if(!isMatch){
        //401 - unauthorized
        return res.status(400).json({ message: "Invalid credentials" });
    }

    //generate token from user id
    const token = generateToken(userExists._id);

    if(userExists && isMatch){
        const { _id, name, email, role, photo, bio, isVerified } = userExists;
        //set token in cookie
        res.cookie("token", token, {
            path: '/',
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, //30 day
            sameSite: true,
            secure: true,
        })

        //sending back user data and token in response to the client
        res.status(200).json({ _id, name, email, role, photo, bio, isVerified, token });
    }
    else{
        res.status(400).json({ message: "Invalid user data" });
    }    
});

//user logout
export const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successfully" });
});

//get user profile
export const getUser = asyncHandler(async (req, res) => {
    //get user data from token without password
    const user = await User.findById(req.user._id).select('-password');
    if(user){
        res.status(200).json(user);
    }
    else{
        res.status(404).json({ message: "User not found" });
    }
});

//update user profile
export const updateUser = asyncHandler(async (req, res) => {
    //get user data from token (protect middleware)
    const user = await User.findById(req.user._id);

    if(user){
        //user properties update
        const{ name, photo, bio } = req.body;
        user.name = req.body.name || user.name;
        user.photo = req.body.photo || user.photo;
        user.bio = req.body.bio || user.bio;

        //save updated user data
        const updated = await user.save();
        res.status(200).json({
            _id: updated._id,
            name: updated.name,
            email: updated.email,
            role: updated.role, 
            photo: updated.photo, 
            bio: updated.bio, 
            isVerified: updated.isVerified });
    }
    else{
        res.status(404).json({ message: "User not found" });
    }
});

//get login status
export const userLoginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        //401 - unauthorized
        res.status(401).json({ message: "Not authorized, Please Login!!" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if(decoded){
        res.status(200).json(true);
    }else{
        res.status(401).json(false);
    }
});