import asyncHandler from 'express-async-handler';
import User from '../../models/auth/userModel.js';
import generateToken from '../../helpers/generateToken.js';
import bycrypt from 'bcrypt';

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