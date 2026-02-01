import express from 'express';
import { body } from 'express-validator';
// IMPORANT: specific adminLogin controller added to imports
import { 
  register, 
  login, 
  adminLogin, 
  getCurrentUser, 
  updateProfile, 
  requestEmailVerification, 
  checkEmailVerification,
  requestRegistrationOTP,
  verifyRegistrationOTP,
  resendRegistrationOTP,
  requestLoginOTP,
  verifyLoginOTP
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== OTP-BASED REGISTRATION ROUTES ====================
router.post(
  '/register/request-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
  ],
  requestRegistrationOTP
);

router.post(
  '/register/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  verifyRegistrationOTP
);

router.post(
  '/register/resend-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  resendRegistrationOTP
);

// ==================== OTP-BASED LOGIN ROUTES ====================
router.post(
  '/login/request-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  requestLoginOTP
);

router.post(
  '/login/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  ],
  verifyLoginOTP
);

// ==================== OLD ROUTES (kept for backward compatibility) ====================

// Request email verification (send verification email)
router.post(
  '/request-verification',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  requestEmailVerification
);

// Check email verification (verify token from email)
router.post('/check-email-verification', checkEmailVerification);

// Register (after email is verified)
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  register
);

// Admin Login (New Route)
router.post(
  '/admin/login',
  [
    body('adminId').notEmpty().withMessage('Admin ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  adminLogin
);

// User Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Get current user
router.get('/me', authMiddleware, getCurrentUser);

// Update profile
router.put('/profile', authMiddleware, updateProfile);

export default router;