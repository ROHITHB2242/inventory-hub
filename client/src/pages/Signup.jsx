// src/pages/Signup.jsx
// Purpose: User registration page with strict validation indicators and responsive styling.

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

export default function Signup() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Check registration constraints
  const validate = () => {
    const newErrors = {};

    // 1. Name presence
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // 3. Password strength validation
    const password = form.password;
    if (!password) {
      newErrors.password = 'Password is required.';
    } else {
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long.';
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'Must contain at least one uppercase letter.';
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = 'Must contain at least one lowercase letter.';
      } else if (!/\d/.test(password)) {
        newErrors.password = 'Must contain at least one number.';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = 'Must contain at least one special character.';
      }
    }

    // 4. Password confirmation match check
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setApiError('');
    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Registration failed.');
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
            Create Account
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, textAlign: 'center' }}>
            Build your professional inventory catalog today
          </Typography>

          {/* API Server Errors */}
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

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Full Name */}
            <TextField
              margin="normal"
              name="name"
              label="Full Name"
              type="text"
              fullWidth
              value={form.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={loading}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
            />

            {/* Email */}
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

            {/* Password */}
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

            {/* Confirm Password */}
            <TextField
              margin="normal"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              fullWidth
              value={form.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
            />

            {/* Submit Button */}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
            </Button>

            {/* Login Navigation Link */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: '#818cf8',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Log In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
