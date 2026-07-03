// src/pages/Login.jsx
// Purpose: Login interface containing standard email inputs and toggleable Google OAuth action.

import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Tooltip
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  // Google OAuth configuration states
  const [googleOauth, setGoogleOauth] = useState({ enabled: false, url: '' });
  const [googleLoading, setGoogleLoading] = useState(true);

  // Check backend for Google OAuth credentials configuration on mount
  useEffect(() => {
    const fetchGoogleUrl = async () => {
      try {
        const data = await authService.getGoogleUrl();
        setGoogleOauth(data);
      } catch (err) {
        console.error("[-] Failed to retrieve Google OAuth configurations: ", err);
      } finally {
        setGoogleLoading(false);
      }
    };
    fetchGoogleUrl();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Perform client-side validations
  const validate = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!form.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError('');
    try {
      await login(form.email.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Login failed. Please check credentials.');
    }
  };

  // Trigger Google Login redirect
  const handleGoogleLogin = () => {
    if (googleOauth.enabled && googleOauth.url) {
      window.location.href = googleOauth.url;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(circle at top right, #1e1b4b 0%, #090d16 100%)',
        py: 4
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(17, 24, 39, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
          }}
        >
          {/* Brand Header */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 1,
              background: 'linear-gradient(45deg, #818cf8, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Outfit', 'Inter', sans-serif"
            }}
          >
            Welcome Back
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, textAlign: 'center' }}>
            Access your inventory management hub
          </Typography>

          {/* Validation Alerts */}
          {apiError && (
            <Alert
              severity="error"
              sx={{
                width: '100%',
                mb: 3,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                '& .MuiAlert-icon': { color: '#f87171' }
              }}
            >
              {apiError}
            </Alert>
          )}

          {/* Credentials Login Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
            />

            <TextField
              margin="normal"
              name="password"
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#4f46e5',
                '&:hover': { backgroundColor: '#4338ca' },
                borderRadius: '8px',
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>

            {/* Separator */}
            <Divider sx={{ my: 2.5, borderColor: '#1f2633', '&::before, &::after': { borderColor: '#1f2633' } }}>
              <Typography variant="caption" sx={{ color: '#475569', px: 1, fontWeight: 600 }}>
                OR
              </Typography>
            </Divider>

            {/* Toggleable Google Sign-in flow */}
            {googleLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
                <CircularProgress size={20} color="primary" />
              </Box>
            ) : googleOauth.enabled ? (
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GoogleIcon />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.2,
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  '&:hover': {
                    borderColor: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                Continue with Google
              </Button>
            ) : (
              <Tooltip title="Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env to enable." placement="top">
                <span>
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled
                    startIcon={<GoogleIcon />}
                    sx={{
                      py: 1.2,
                      borderColor: 'rgba(255,255,255,0.05) !important',
                      color: 'rgba(255,255,255,0.2) !important',
                      textTransform: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    Google Login (Disabled)
                  </Button>
                </span>
              </Tooltip>
            )}

            {/* Registration Navigation Link */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    color: '#818cf8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
