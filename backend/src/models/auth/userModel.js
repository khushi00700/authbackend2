import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },

    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email address",
        ],
    },

    password: {
        type: String,
        required: [true, "Please enter your password"],
    },

    photo: {
        type: String,
        default: "https://res.cloudinary.com/djz3p8sye/image/upload/v1631286737/avatar/avatar_cugq40.png",
    },

    bio: {
        type: String,
        default: "I am a new user",
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },

    isVerified: {
        type: Boolean,
        default: false,
    },
}, {timestamps: true , minimize: true});

const User = mongoose.model("User", userSchema);

export default User;
