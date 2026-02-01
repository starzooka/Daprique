import User from '../models/User.js';
import Admin from '../models/Admin.js'; // <--- NEW: Import Admin Model
import { generateToken } from '../utils/jwt.js';
import { validationResult } from 'express-validator';
import { generateVerificationToken, sendVerificationEmail, verifyToken, sendRegistrationOTP, sendLoginOTP } from '../utils/emailService.js';

// --- UPDATED: Admin Login ---
export const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { adminId, password } = req.body;

    // 1. Search in the ADMIN collection
    // Checks if the input matches either 'email' OR 'adminId'
    const admin = await Admin.findOne({
      $or: [{ email: adminId }, { adminId: adminId }]
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ message: 'Invalid Admin ID or password' });
    }

    // 2. Check Password
    // Uses the comparePassword method defined in your Admin.js model
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Admin ID or password' });
    }

    // 3. Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save();

    // 4. Generate Token
    const token = generateToken(admin._id);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        id: admin._id,
        adminId: admin.adminId, // distinct field for admins
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions, // include permissions in response
      },
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// --- EXISTING USER FUNCTIONS ---

// Request email verification (send verification email)
export const requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Send verification email
    const emailSent = await sendVerificationEmail(email, 'New User', verificationToken);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(200).json({
      message: 'Verification email sent successfully',
      email: email,
      token: verificationToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Check if email is verified (verify token from email link)
export const checkEmailVerification = async (req, res) => {
  try {
    const { token, email } = req.body;

    console.log('checkEmailVerification called - email:', email, 'token length:', token?.length);

    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email are required' });
    }

    // Verify the token against stored tokens
    const isValid = await verifyToken(token, email);

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    res.status(200).json({
      message: 'Email verified successfully',
      email: email,
      isVerified: true,
    });
  } catch (error) {
    console.error('Error in checkEmailVerification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Register user (after email is verified)
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with email already verified
    user = new User({
      name,
      email,
      password,
      phone,
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationTokenExpiry: undefined,
    });
    await user.save();

    res.status(201).json({
      message: 'Account created successfully',
      email: user.email,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists and get password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in',
        email: user.email,
        isVerified: false,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email are required' });
    }

    const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationTokenExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if token matches and is not expired
    if (user.emailVerificationToken !== token) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (new Date() > user.emailVerificationTokenExpiry) {
      return res.status(400).json({ message: 'Verification token expired' });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully. You can now login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiry = tokenExpiry;
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.status(200).json({
      message: 'Verification email sent successfully',
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== OTP-BASED REGISTRATION ====================

// Request Registration OTP
export const requestRegistrationOTP = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ message: 'Email already registered and verified' });
    }

    // If user exists but not verified, delete the old record
    if (existingUser && !existingUser.isEmailVerified) {
      await User.findByIdAndDelete(existingUser._id);
    }

    // Create user with unverified status
    const user = new User({
      email,
      password,
      name,
      phone: phone || '',
      isEmailVerified: false,
    });

    await user.save();

    // Send OTP email
    const result = await sendRegistrationOTP(email, name);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({ message: result.message });
    }

    // Update user with OTP
    user.registrationOTP = result.otp;
    user.registrationOTPExpiry = result.otpExpiry;
    await user.save();

    res.status(200).json({
      message: 'OTP sent to your email',
      otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
      attemptsRemaining: result.attemptsRemaining,
    });
  } catch (error) {
    console.error('Request Registration OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify Registration OTP
export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user with OTP
    const user = await User.findOne({ email }).select('+registrationOTP +registrationOTPExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check if OTP exists
    if (!user.registrationOTP) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one' });
    }

    // Check if OTP expired
    if (new Date() > user.registrationOTPExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one' });
    }

    // Verify OTP
    if (user.registrationOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.registrationOTP = undefined;
    user.registrationOTPExpiry = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Email verified successfully! Account created.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Verify Registration OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Resend Registration OTP
export const resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Send new OTP
    const result = await sendRegistrationOTP(email, user.name);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({ message: result.message });
    }

    // Update user with new OTP
    user.registrationOTP = result.otp;
    user.registrationOTPExpiry = result.otpExpiry;
    await user.save();

    res.status(200).json({
      message: 'New OTP sent to your email',
      otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
      attemptsRemaining: result.attemptsRemaining,
    });
  } catch (error) {
    console.error('Resend Registration OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== OTP-BASED LOGIN ====================

// Request Login OTP
export const requestLoginOTP = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    // Send OTP
    const result = await sendLoginOTP(email, user.name);

    if (!result.success) {
      return res.status(result.statusCode || 500).json({ message: result.message });
    }

    // Update user with OTP
    user.loginOTP = result.otp;
    user.loginOTPExpiry = result.otpExpiry;
    await user.save();

    res.status(200).json({
      message: 'OTP sent to your email',
      otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
      attemptsRemaining: result.attemptsRemaining,
    });
  } catch (error) {
    console.error('Request Login OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify Login OTP
export const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find user with OTP
    const user = await User.findOne({ email }).select('+loginOTP +loginOTPExpiry');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists
    if (!user.loginOTP) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one' });
    }

    // Check if OTP expired
    if (new Date() > user.loginOTPExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one' });
    }

    // Verify OTP
    if (user.loginOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP and update last login
    user.loginOTP = undefined;
    user.loginOTPExpiry = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Verify Login OTP Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};