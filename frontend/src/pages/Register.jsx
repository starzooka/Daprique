import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/services.js';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  
  const [stage, setStage] = useState('form'); // form, otp, success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpExpiryTime, setOtpExpiryTime] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(10);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    phone: '',
  });

  const [otpData, setOtpData] = useState({
    otp: '',
    email: '',
  });

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Step 1: Request registration OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name) {
      setError('Email, name, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.post('/auth/register/request-otp', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
      });

      setOtpData(prev => ({ ...prev, email: formData.email }));
      setOtpExpiryTime(response.data.otpExpiryMinutes);
      setAttemptsRemaining(response.data.attemptsRemaining || 9);
      setSuccess('OTP sent to your email! Check your inbox.');
      setStage('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otpData.otp) {
      setError('Please enter the OTP');
      return;
    }

    if (otpData.otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.post('/auth/register/verify-otp', {
        email: otpData.email,
        otp: otpData.otp,
      });

      setSuccess('Email verified! Account created successfully!');
      setStage('success');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await authAPI.post('/auth/register/resend-otp', {
        email: otpData.email,
      });

      setOtpExpiryTime(response.data.otpExpiryMinutes);
      setAttemptsRemaining(response.data.attemptsRemaining || 9);
      setSuccess('New OTP sent to your email!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join us for a great shopping experience</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* STAGE 1: Registration Form */}
        {stage === 'form' && (
          <form onSubmit={handleRequestOTP} className="auth-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="your@email.com"
                required
              />
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                We'll send you an OTP to verify your email
              </p>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.email || !formData.password || !formData.name}
              className="submit-btn"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* STAGE 2: OTP Verification */}
        {stage === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                We've sent a 6-digit OTP to <strong>{otpData.email}</strong>
              </p>
              <input
                type="text"
                value={otpData.otp}
                onChange={(e) => setOtpData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="000000"
                maxLength="6"
                required
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '0.5rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                OTP expires in {otpExpiryTime} minutes
              </p>
              <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: '500' }}>
                Attempts remaining today: {attemptsRemaining}
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || otpData.otp.length !== 6}
              className="submit-btn"
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                Didn't receive the OTP?{' '}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: '600'
                  }}
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </form>
        )}

        {/* STAGE 3: Success */}
        {stage === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
            <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Account Created Successfully!</h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Your account has been created and verified. Redirecting to login...
            </p>
          </div>
        )}

        <div className="auth-footer">
          <p>Already have an account?{' '}
            <Link to="/login" className="link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
