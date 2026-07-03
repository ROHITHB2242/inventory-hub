// src/components/Sidebar.jsx
// Purpose: Collapsible sidebar navigation component supporting desktop and mobile responsiveness.

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Divider,
  Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 80;

export default function Sidebar({
  mobileOpen,
  handleDrawerToggle,
  isCollapsed,
  handleCollapseToggle,
  isMobile
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation menu items mapping names, paths, and icons
  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Database Admin', path: '/admin/db', icon: <StorageIcon /> }
  ];

  // Helper to check if a route is currently active
  const isActive = (path) => location.pathname === path;

  // Sidebar internal contents
  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0d0f13',
        color: '#b0b8c4',
        borderRight: '1px solid #1f2633',
        position: 'relative'
      }}
    >
      {/* 1. Logo / Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed && !isMobile ? 'center' : 'space-between',
          p: 2,
          minHeight: '64px'
        }}
      >
        {(!isCollapsed || isMobile) ? (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.5px',
              background: 'linear-gradient(45deg, #4f46e5, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            InventoryHub
          </Typography>
        ) : (
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(45deg, #4f46e5, #06b6d4)',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: '#fff'
            }}
          >
            IH
          </Avatar>
        )}

        {/* Desktop sidebar toggle button */}
        {!isMobile && (
          <IconButton
            onClick={handleCollapseToggle}
            sx={{
              color: '#b0b8c4',
              display: { xs: 'none', sm: 'inline-flex' },
              '&:hover': { backgroundColor: '#1e2533', color: '#fff' }
            }}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: '#1f2633' }} />

      {/* 2. Navigation Options list */}
      <Box sx={{ flexGrow: 1, py: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) handleDrawerToggle();
                  }}
                  sx={{
                    minHeight: 48,
                    justifyContent: isCollapsed && !isMobile ? 'center' : 'initial',
                    px: 2.5,
                    borderRadius: '8px',
                    backgroundColor: active ? '#1a1f2c' : 'transparent',
                    color: active ? '#38bdf8' : '#b0b8c4',
                    borderLeft: active ? '4px solid #38bdf8' : '4px solid transparent',
                    '&:hover': {
                      backgroundColor: '#131822',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' }
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed && !isMobile ? 0 : 2.5,
                      justifyContent: 'center',
                      color: active ? '#38bdf8' : '#64748b',
                      transition: 'color 0.2s'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!isCollapsed || isMobile) && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: active ? 600 : 500,
                        letterSpacing: '0.2px'
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Divider sx={{ borderColor: '#1f2633' }} />

      {/* 3. User info and Logout Footer */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={user?.picture || undefined}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid #1f2633',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontWeight: 600
            }}
          >
            {/* Fallback to name initials if picture is absent */}
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
          </Avatar>
          
          {(!isCollapsed || isMobile) && (
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}
              >
                {user?.name || 'User Name'}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}
              >
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          )}
        </Box>

        {(!isCollapsed || isMobile) ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            fullWidth
            onClick={logout}
            sx={{
              backgroundColor: '#e11d48',
              '&:hover': { backgroundColor: '#be123c' },
              borderRadius: '8px',
              py: 1,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Log Out
          </Button>
        ) : (
          <IconButton
            color="error"
            onClick={logout}
            sx={{
              alignSelf: 'center',
              backgroundColor: '#1f1619',
              color: '#f43f5e',
              border: '1px solid #3c1e23',
              '&:hover': { backgroundColor: '#f43f5e', color: '#fff' },
              width: 40,
              height: 40
            }}
          >
            <LogoutIcon size={18} />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH },
        flexShrink: { sm: 0 },
        transition: 'width 0.2s ease-in-out'
      }}
    >
      {/* Mobile view Drawer overlay */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: 'none'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop view docked permanent Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH,
            borderRight: 'none',
            transition: 'width 0.2s ease-in-out',
            overflowX: 'hidden'
          }
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
