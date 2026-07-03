// src/pages/OAuthCallback.jsx
// Purpose: Landing page for Google OAuth redirect, exchanging code for local JWT session.

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import authService from '../services/authService';
import { Container, Paper, CircularProgress, Typography, Box, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/ErrorOutlineOutlined';

export default function OAuthCallback() {
  const { loginWithGoogleToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  
  // Ref to prevent double executions of callback in StrictMode
  const effectRan = useRef(false);

  useEffect(() => {
    // Only execute if it hasn't run yet in this lifecycle
    if (effectRan.current) return;
    effectRan.current = true;

    const code = searchParams.get('code');
    if (!code) {
      setError('Authorization code is missing from Google callback.');
      return;
    }

    const exchangeCode = async () => {
      try {
        // Post authorization code to server to exchange and register
        const data = await authService.googleCallback(code);
        
        // Populate credentials in local app state
        loginWithGoogleToken(data.access_token, data.user);
        
        // Route directly to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error("[-] Google callback exchange error: ", err);
        setError(err.response?.data?.detail || 'Failed to authenticate using Google OAuth.');
      }
    };

    exchangeCode();
  }, [searchParams, loginWithGoogleToken, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(circle at top right, #1e1b4b 0%, #090d16 100%)',
        color: '#fff'
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
            textAlign: 'center'
          }}
        >
          {error ? (
            // Error panel
            <Box>
              <ErrorIcon sx={{ fontSize: 56, color: '#f43f5e', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#f43f5e' }}>
                Authentication Error
              </Typography>
              <Typography variant="body2" sx={{ color: '#b0b8c4', mb: 3 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: '#4f46e5',
                  '&:hover': { backgroundColor: '#4338ca' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 4
                }}
              >
                Back to Login
              </Button>
            </Box>
          ) : (
            // Loading panel
            <Box>
              <CircularProgress size={50} sx={{ mb: 3, color: '#38bdf8' }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Authorizing Session...
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Exchanging authentication details with Google. Please do not close this window.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
