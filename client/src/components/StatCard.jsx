// src/components/StatCard.jsx
// Purpose: Reusable KPI card with glassmorphic styling and micro-animations.

import React from 'react';
import { Card, Box, Typography } from '@mui/material';

/**
 * Renders a glassmorphic KPI dashboard metric card.
 * @param {string} title - Title of the card.
 * @param {string|number} value - Main stat value to display.
 * @param {React.ReactElement} icon - The icon component to display.
 * @param {string} iconBg - Color for the icon circle container.
 * @param {string} subtitle - Secondary caption or description.
 * @param {string} subtitleColor - CSS color for the subtitle.
 */
export default function StatCard({ title, value, icon, iconBg = '#4f46e5', subtitle, subtitleColor = '#64748b' }) {
  return (
    <Card
      sx={{
        position: 'relative',
        background: 'rgba(17, 24, 39, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        p: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          borderColor: 'rgba(56, 189, 248, 0.4)',
          boxShadow: '0 12px 40px 0 rgba(56, 189, 248, 0.15)',
        },
      }}
    >
      {/* Glow Effect Element */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          background: `linear-gradient(90deg, ${iconBg}, #06b6d4)`,
        }}
      />

      {/* KPI Details */}
      <Box>
        <Typography
          variant="caption"
          sx={{
            color: '#94a3b8',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.75rem',
            display: 'block',
            mb: 1
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: '#fff',
            mb: 0.5,
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: subtitleColor,
              fontWeight: 500,
              fontSize: '0.8rem'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Icon Wrapper */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 52,
          height: 52,
          borderRadius: '12px',
          backgroundColor: `${iconBg}20`, // Add transparency (hex + 20)
          color: iconBg,
          border: `1px solid ${iconBg}40`,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 28 } })}
      </Box>
    </Card>
  );
}
