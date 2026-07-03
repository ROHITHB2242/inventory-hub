// src/pages/DbAdmin.jsx
// Purpose: Provide a Database Administration page to query, view raw details of, and delete documents in MongoDB.

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import Sidebar from '../components/Sidebar';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Storage as StorageIcon
} from '@mui/icons-material';

export default function DbAdmin() {

  // Layout states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTab, setCurrentTab] = useState(0); // 0 = Users, 1 = Products

  // Data states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog and Action states
  const [jsonViewOpen, setJsonViewOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Alert/Toast states
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Load all DB data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, productsData] = await Promise.all([
        adminService.fetchUsers(),
        adminService.fetchProducts()
      ]);
      setUsers(usersData);
      setProducts(productsData);
    } catch (err) {
      console.error("[-] Failed to query database documents: ", err);
      showToast('Could not load database records. Ensure connection is active.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toast Helpers
  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };
  const handleToastClose = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Sidebar toggle helpers
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);

  // Tab switch helper
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSearchQuery('');
  };

  // View JSON Helper
  const handleViewJsonClick = (record) => {
    setSelectedRecord(record);
    setJsonViewOpen(true);
  };

  // Delete Record Helpers
  const handleDeleteClick = (record, type) => {
    setRecordToDelete({ ...record, type });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setDeleteLoading(true);
    try {
      if (recordToDelete.type === 'user') {
        await adminService.deleteUser(recordToDelete.id);
        showToast('User and associated products successfully deleted.');
      } else {
        await adminService.deleteProduct(recordToDelete.id);
        showToast('Product document deleted successfully.');
      }
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      // Reload documents
      await loadData();
    } catch (err) {
      console.error("[-] Failed to delete record: ", err);
      showToast(err.response?.data?.detail || 'An error occurred while deleting the record.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered collections based on search query
  const filteredUsers = users.filter(u => 
    u.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.provider?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.owner_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16' }}>
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
        handleCollapseToggle={handleCollapseToggle}
        isMobile={false}
      />

      {/* 2. Primary Page Contents */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${isCollapsed ? 80 : 260}px)` },
          transition: 'width 0.2s ease-in-out',
          overflowY: 'auto',
          color: '#fff'
        }}
      >
        {/* Mobile Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            minHeight: '48px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { sm: 'none' }, color: '#fff' }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <StorageIcon sx={{ color: '#818cf8' }} /> Database Admin Panel
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', display: { xs: 'none', sm: 'block' } }}>
                Inspect raw MongoDB database records and collection states.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
            sx={{
              color: '#818cf8',
              borderColor: 'rgba(129, 140, 248, 0.3)',
              borderRadius: '8px',
              px: { xs: 2, sm: 3 },
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                borderColor: '#818cf8',
                backgroundColor: 'rgba(129, 140, 248, 0.08)'
              }
            }}
          >
            Refresh Collections
          </Button>
        </Box>

        {/* 3. Analytics KPI Tiles */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Card 1: Total Users */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'rgba(17, 24, 39, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Avatar sx={{ bgcolor: '#4f46e5', width: 48, height: 48 }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  USERS COLLECTION (`users`)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                  {users.length}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Card 2: Total Products */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'rgba(17, 24, 39, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Avatar sx={{ bgcolor: '#06b6d4', width: 48, height: 48 }}>
                <InventoryIcon />
              </Avatar>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                  PRODUCTS COLLECTION (`products`)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                  {products.length}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* 4. Controls Row (Tabs / Search) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3,
            borderBottom: '1px solid #1f2633',
            pb: 1
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': { backgroundColor: '#818cf8' },
              '& .MuiTab-root': {
                color: '#64748b',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                '&.Mui-selected': { color: '#818cf8' }
              }
            }}
          >
            <Tab label="Users Collection" />
            <Tab label="Products Collection" />
          </Tabs>

          <TextField
            placeholder={
              currentTab === 0 
                ? "Search by Name, Email, ID or Provider..." 
                : "Search by Name, SKU, Category, ID or Owner..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#475569' }} />
                </InputAdornment>
              ),
              style: { color: '#fff', backgroundColor: 'rgba(17, 24, 39, 0.4)' }
            }}
            sx={{
              width: { xs: '100%', md: 400 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                borderColor: '#1f2633',
                '&:hover fieldset': { borderColor: '#475569' },
                '&.Mui-focused fieldset': { borderColor: '#818cf8' }
              }
            }}
          />
        </Box>

        {/* 5. Collection Documents Grid/Table */}
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
            <CircularProgress sx={{ color: '#818cf8' }} />
            <Typography variant="body2" sx={{ color: '#64748b' }}>Querying database collections...</Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              backgroundColor: 'rgba(17, 24, 39, 0.6)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              maxHeight: '500px'
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {currentTab === 0 ? (
                    <>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Picture</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Provider</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Created At</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>SKU</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Price</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Qty</TableCell>
                      <TableCell sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Owner ID</TableCell>
                      <TableCell align="center" sx={{ backgroundColor: '#111827', color: '#94a3b8', fontWeight: 700 }}>Actions</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTab === 0 ? (
                  filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ color: '#64748b', py: 4 }}>
                        No user documents found matching query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ borderColor: '#1f2633' }}>
                          <Avatar src={u.picture} sx={{ width: 32, height: 32 }}>
                            {u.name?.charAt(0).toUpperCase()}
                          </Avatar>
                        </TableCell>
                        <TableCell sx={{ color: '#818cf8', fontFamily: 'monospace', borderColor: '#1f2633' }}>
                          {u.id}
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600, borderColor: '#1f2633' }}>
                          {u.name}
                        </TableCell>
                        <TableCell sx={{ color: '#b0b8c4', borderColor: '#1f2633' }}>
                          {u.email}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#1f2633' }}>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.25,
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              backgroundColor: u.provider === 'google' ? 'rgba(219,68,85,0.15)' : 'rgba(79,70,229,0.15)',
                              color: u.provider === 'google' ? '#f43f5e' : '#818cf8'
                            }}
                          >
                            {u.provider}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', borderColor: '#1f2633' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell align="center" sx={{ borderColor: '#1f2633' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Raw JSON Document">
                              <IconButton onClick={() => handleViewJsonClick(u)} sx={{ color: '#38bdf8' }}>
                                <VisibilityIcon size="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User Document">
                              <IconButton onClick={() => handleDeleteClick(u, 'user')} sx={{ color: '#ef4444' }}>
                                <DeleteIcon size="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ color: '#64748b', py: 4 }}>
                        No product documents found matching query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((p) => (
                      <TableRow key={p.id} sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ color: '#818cf8', fontFamily: 'monospace', borderColor: '#1f2633' }}>
                          {p.id}
                        </TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600, borderColor: '#1f2633' }}>
                          {p.name}
                        </TableCell>
                        <TableCell sx={{ color: '#b0b8c4', borderColor: '#1f2633' }}>
                          {p.sku}
                        </TableCell>
                        <TableCell sx={{ color: '#94a3b8', borderColor: '#1f2633' }}>
                          {p.category}
                        </TableCell>
                        <TableCell sx={{ color: '#10b981', fontWeight: 700, borderColor: '#1f2633' }}>
                          ${p.price.toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ color: '#fff', borderColor: '#1f2633' }}>
                          {p.quantity}
                        </TableCell>
                        <TableCell sx={{ color: '#64748b', fontFamily: 'monospace', borderColor: '#1f2633' }}>
                          {p.owner_id}
                        </TableCell>
                        <TableCell align="center" sx={{ borderColor: '#1f2633' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Tooltip title="View Raw JSON Document">
                              <IconButton onClick={() => handleViewJsonClick(p)} sx={{ color: '#38bdf8' }}>
                                <VisibilityIcon size="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Product Document">
                              <IconButton onClick={() => handleDeleteClick(p, 'product')} sx={{ color: '#ef4444' }}>
                                <DeleteIcon size="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* 6. Raw JSON Viewer Dialog */}
      <Dialog
        open={jsonViewOpen}
        onClose={() => setJsonViewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #1f2633', pb: 2 }}>
          Raw Document JSON
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box
            component="pre"
            sx={{
              p: 2,
              borderRadius: '8px',
              backgroundColor: '#090d16',
              color: '#38bdf8',
              overflowX: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              border: '1px solid #1f2633'
            }}
          >
            {JSON.stringify(selectedRecord, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1f2633' }}>
          <Button
            onClick={() => setJsonViewOpen(false)}
            variant="contained"
            sx={{
              backgroundColor: '#4f46e5',
              '&:hover': { backgroundColor: '#4338ca' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 4
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* 7. Action Confirm Deletion Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: '#111827',
            color: '#fff',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Database Record</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#b0b8c4' }}>
            Are you sure you want to permanently delete this document from the database collection?
            {recordToDelete?.type === 'user' && (
              <Box component="span" sx={{ display: 'block', mt: 1.5, color: '#f43f5e', fontWeight: 600 }}>
                WARNING: Deleting a user will also cascade-delete all products associated with this user ID!
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1f2633', mt: 1 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
            sx={{ color: '#94a3b8', textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            sx={{
              backgroundColor: '#e11d48',
              '&:hover': { backgroundColor: '#be123c' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3
            }}
          >
            {deleteLoading ? <CircularProgress size={16} color="inherit" /> : 'Confirm Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 8. Notification Toast System */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast.severity}
          sx={{
            width: '100%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
