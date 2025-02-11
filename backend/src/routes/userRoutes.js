import express from 'express';
import { getUser, loginUser, logoutUser, registerUser, updateUser, userLoginStatus } from '../controllers/auth/userController.js';
import { adminMiddleware, creatorMiddleware, protect } from '../middleware/authMiddleware.js';
import { deleteUser, getAllUsers } from '../controllers/auth/adminController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/user', protect, getUser);
router.patch('/user', protect, updateUser);

//admin routes
router.delete('/admin/user/:id', protect,adminMiddleware, deleteUser);

//get all users
router.get('/admin/user', protect, creatorMiddleware, getAllUsers);

//login status
router.get('/login-status', userLoginStatus);

export default router;