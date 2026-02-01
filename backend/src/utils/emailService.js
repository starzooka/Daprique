import crypto from 'crypto';
import { Resend } from 'resend';
import VerificationToken from '../models/VerificationToken.js';
import OTPAttempt from '../models/OTPAttempt.js';

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (userEmail, userName, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(userEmail)}`;

    // Store token in database with 24-hour expiry
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Delete any existing tokens for this email
    await VerificationToken.deleteMany({ email: userEmail });
    
    // Create new verification token record
    await VerificationToken.create({
      email: userEmail,
      token: token,
      expiresAt: expiresAt,
    });

    // Dev fallback: if no API key configured, log the link so flow can continue locally
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
      console.log('\n=== VERIFICATION EMAIL (DEV MODE) ===');
      console.log(`To: ${userEmail}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('====================================\n');
      return true;
    }

    // Initialize Resend with API key (lazy init to ensure env is loaded)
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: userEmail,
      subject: 'Email Verification - FashionHub',
      html: `
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: -0.02em;">Welcome to FashionHub</h1>
          </div>
          <div style="background: #f8fafc; padding: 2rem; border-radius: 0 0 12px 12px;">
            <p style="color: #0f172a; font-size: 1.05rem; margin: 0 0 1rem 0;">Hi <strong>${userName}</strong>,</p>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1.5rem;">Thank you for creating an account! Please verify your email address by clicking below.</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);">Verify Email Address</a>
            </div>
            <p style="color: #6b7280; font-size: 0.95rem; margin: 2rem 0 1rem 0;">Or copy and paste this link:</p>
            <p style="background: #e2e8f0; padding: 1rem; border-radius: 8px; word-break: break-all; font-size: 0.85rem; color: #0f172a; margin-bottom: 1.5rem;">${verificationUrl}</p>
            <p style="color: #6b7280; font-size: 0.9rem; margin: 1rem 0 0 0;">This link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
            <p style="color: #6b7280; font-size: 0.85rem; margin: 0;">If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Verify token and check expiry
export const verifyToken = async (token, email) => {
  try {
    const verificationRecord = await VerificationToken.findOne({ 
      token, 
      email 
    });

    if (!verificationRecord) {
      return false;
    }

    // Check if token has expired
    if (new Date() > verificationRecord.expiresAt) {
      await VerificationToken.deleteOne({ _id: verificationRecord._id });
      return false;
    }

    // Delete token after successful verification
    await VerificationToken.deleteOne({ _id: verificationRecord._id });
    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

// ==================== OTP FUNCTIONS ====================

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check rate limit for OTP requests
const checkRateLimit = async (email, type) => {
  const count = await OTPAttempt.countDocuments({
    email,
    type,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  return {
    allowed: count < 10,
    remaining: Math.max(0, 10 - count)
  };
};

// Record OTP attempt
const recordOTPAttempt = async (email, type) => {
  await OTPAttempt.create({ email, type });
};

// Send Registration OTP
export const sendRegistrationOTP = async (userEmail, userName) => {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(userEmail, 'registration');
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: 'Maximum OTP requests reached for today. Please try again tomorrow.',
        statusCode: 429
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send OTP email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Daprique <noreply@auth.starzooka.tech>',
      to: userEmail,
      subject: 'Your Registration OTP - Daprique',
      html: `
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: -0.02em;">Welcome to Daprique</h1>
          </div>
          <div style="background: #f8fafc; padding: 2rem; border-radius: 0 0 12px 12px;">
            <p style="color: #0f172a; font-size: 1.05rem; margin: 0 0 1rem 0;">Hi <strong>${userName}</strong>,</p>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1.5rem;">Your OTP for email verification is:</p>
            <div style="text-align: center; margin: 2rem 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.5rem; display: inline-block; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">${otp}</div>
            </div>
            <p style="color: #6b7280; font-size: 0.95rem; margin: 2rem 0 1rem 0;">This OTP will expire in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
            <p style="color: #6b7280; font-size: 0.85rem; margin: 0;">If you didn't request this OTP, please ignore this email.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP email',
        statusCode: 500
      };
    }

    console.log('✅ Registration OTP sent successfully:', data);

    // Record the attempt
    await recordOTPAttempt(userEmail, 'registration');

    return {
      success: true,
      otp,
      otpExpiry,
      attemptsRemaining: rateLimit.remaining - 1
    };
  } catch (error) {
    console.error('❌ Send Registration OTP Error:', error);
    return {
      success: false,
      message: 'Server error while sending OTP',
      statusCode: 500
    };
  }
};

// Send Login OTP
export const sendLoginOTP = async (userEmail, userName) => {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit(userEmail, 'login');
    if (!rateLimit.allowed) {
      return {
        success: false,
        message: 'Maximum OTP requests reached for today. Please try again tomorrow.',
        statusCode: 429
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send OTP email
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Daprique <noreply@auth.starzooka.tech>',
      to: userEmail,
      subject: 'Your Login OTP - Daprique',
      html: `
        <div style="font-family: 'Manrope', sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 1.8rem; letter-spacing: -0.02em;">Login to Daprique</h1>
          </div>
          <div style="background: #f8fafc; padding: 2rem; border-radius: 0 0 12px 12px;">
            <p style="color: #0f172a; font-size: 1.05rem; margin: 0 0 1rem 0;">Hi <strong>${userName}</strong>,</p>
            <p style="color: #6b7280; line-height: 1.6; margin-bottom: 1.5rem;">Your OTP for login verification is:</p>
            <div style="text-align: center; margin: 2rem 0;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; font-size: 2.5rem; font-weight: 700; letter-spacing: 0.5rem; display: inline-block; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">${otp}</div>
            </div>
            <p style="color: #6b7280; font-size: 0.95rem; margin: 2rem 0 1rem 0;">This OTP will expire in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;" />
            <p style="color: #6b7280; font-size: 0.85rem; margin: 0;">If you didn't request this OTP, please secure your account immediately.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP email',
        statusCode: 500
      };
    }

    console.log('✅ Login OTP sent successfully:', data);

    // Record the attempt
    await recordOTPAttempt(userEmail, 'login');

    return {
      success: true,
      otp,
      otpExpiry,
      attemptsRemaining: rateLimit.remaining - 1
    };
  } catch (error) {
    console.error('❌ Send Login OTP Error:', error);
    return {
      success: false,
      message: 'Server error while sending OTP',
      statusCode: 500
    };
  }
};
