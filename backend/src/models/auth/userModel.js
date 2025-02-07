import mongoose from "mongoose";
import bcrypt from "bcrypt";

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

//hash password before saving
userSchema.pre("save", async function (next) {
    //if password is not modified
    if (!this.isModified("password")) {
       return next();
    }
    //hash password => bycrypt
    //generate salt
    const salt = await bcrypt.genSalt(10);
    //hash password with salt
    const hashedPassword = await bcrypt.hash(this.password, salt);
    //set password to hashed password
    this.password = hashedPassword;

    //call next middleware
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
