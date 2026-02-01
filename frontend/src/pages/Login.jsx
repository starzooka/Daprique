import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/services.js';
import useAuthStore from '../context/authStore.js';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const [stage, setStage] = useState('credentials'); // credentials | otp
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otpData, setOtpData] = useState({
    otp: '',
  });
  const [otpExpiryTime, setOtpExpiryTime] = useState(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(10);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    try {
      setLoading(true);
      const response = await authAPI.requestLoginOTP({
        email: formData.email,
        password: formData.password,
      });

      setOtpExpiryTime(response.data.otpExpiryMinutes);
      setAttemptsRemaining(response.data.attemptsRemaining ?? 9);
      setOtpData({ otp: '' });
      setStage('otp');
      setSuccess('OTP sent to your email.');
    } catch (error) {
      if (error.response?.status === 403) {
        setErrors({
          submit: error.response?.data?.message || 'Please verify your email first',
          unverified: true,
        });
      } else {
        setErrors({
          submit: error.response?.data?.message || 'Login failed',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');

    if (!otpData.otp || otpData.otp.length !== 6) {
      setErrors({ submit: 'OTP must be 6 digits' });
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyLoginOTP({
        email: formData.email,
        otp: otpData.otp,
      });

      setUser(response.data.user, response.data.token);
      navigate('/');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Invalid or expired OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setErrors({});
    setSuccess('');

    try {
      setLoading(true);
      const response = await authAPI.requestLoginOTP({
        email: formData.email,
        password: formData.password,
      });

      setOtpExpiryTime(response.data.otpExpiryMinutes);
      setAttemptsRemaining(response.data.attemptsRemaining ?? 9);
      setSuccess('New OTP sent to your email.');
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Failed to resend OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login</h2>

        {success && <div className="success-message">{success}</div>}

        {stage === 'credentials' && (
          <form onSubmit={handleRequestOTP} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {errors.submit && (
              <div className="error-message">
                {errors.submit}
                {errors.unverified && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
                    <Link
                      to="/register"
                      style={{
                        color: 'inherit',
                        textDecoration: 'underline',
                        fontWeight: '600',
                      }}
                    >
                      Go to registration
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {stage === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label>Enter OTP</label>
              <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
                We've sent a 6-digit OTP to <strong>{formData.email}</strong>
              </p>
              <input
                type="text"
                value={otpData.otp}
                onChange={(e) =>
                  setOtpData({
                    otp: e.target.value.replace(/\D/g, '').slice(0, 6),
                  })
                }
                placeholder="000000"
                maxLength="6"
                required
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  letterSpacing: '0.5rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                }}
              />

              {otpExpiryTime && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  OTP expires in {otpExpiryTime} minutes
                </p>
              )}
              <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: '500' }}>
                Attempts remaining today: {attemptsRemaining}
              </p>
            </div>

            {errors.submit && <div className="error-message">{errors.submit}</div>}

            <button
              type="submit"
              disabled={loading || otpData.otp.length !== 6}
              className="submit-btn"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
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
                    fontWeight: '600',
                  }}
                >
                  Resend OTP
                </button>
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStage('credentials');
                  setOtpData({ otp: '' });
                  setErrors({});
                  setSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  marginTop: '0.5rem',
                }}
              >
                Use different credentials
              </button>
            </div>
          </form>
        )}

        <div className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
