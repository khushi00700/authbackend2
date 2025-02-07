import asyncHandler from 'express-async-handler';
import User from '../../models/auth/userModel.js';


export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    //attempt to find and delete user
    try {
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        return res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "Cannot delete user"});
    }
});

//get all users
export const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({});
        if(!users){
            return res.status(404).json({message: "No users found"});
        }
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({message: "Cannot get users"});
    }
});