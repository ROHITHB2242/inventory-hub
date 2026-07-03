// src/pages/Dashboard.jsx
// Purpose: Dashboard layout coordinates sidebars, analytics cards, list search tables, and CRUD dialogs.

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import itemService from '../services/itemService';
import useDebounce from '../hooks/useDebounce';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import ItemTable from '../components/ItemTable';
import ItemForm from '../components/ItemForm';
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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Menu as MenuIcon,
  Inventory2 as InventoryIcon,
  AttachMoney as ValueIcon,
  WarningAmber as WarningIcon,
  CancelOutlined as OutIcon
} from '@mui/icons-material';

export default function Dashboard() {
  const { user } = useAuth();

  // Layout states
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data states
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total_items: 0,
    out_of_stock: 0,
    low_stock: 0,
    total_value: 0
  });

  // Query states
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Interaction loading / triggers
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Deletion prompt confirmation state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Notifications states
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  // Toggle layout handlers
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);

  // Show status popup toast
  const triggerToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => setToast((prev) => ({ ...prev, open: false }));

  // Retrieve products list from services
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await itemService.getProducts({
        page,
        size,
        sort_by: sortBy,
        sort_dir: sortDir,
        search: debouncedSearch
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("[-] Failed to load products: ", err);
      triggerToast('Error loading product records.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, debouncedSearch]);

  // Retrieve stats calculations from services
  const fetchStats = useCallback(async () => {
    try {
      const data = await itemService.getStats();
      setStats(data);
    } catch (err) {
      console.error("[-] Failed to load statistics: ", err);
    }
  }, []);

  // Sync data on page load, pagination edits, or searches
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset page when typing in search to prevent out of bounds
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Sorting columns handler
  const handleSortChange = (property, direction) => {
    setSortBy(property);
    setSortDir(direction);
  };

  // Open creation modal
  const handleAddClick = () => {
    setSelectedItem(null);
    setFormOpen(true);
  };

  // Open edit modal
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setFormOpen(true);
  };

  // Open delete validation modal
  const handleDeleteClick = (id) => {
    setDeleteItemId(id);
    setDeleteOpen(true);
  };

  // Submit product creation / updates
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (selectedItem) {
        // Run update query
        await itemService.updateProduct(selectedItem.id, formData);
        triggerToast('Product details updated successfully.', 'success');
      } else {
        // Run creation query
        await itemService.createProduct(formData);
        triggerToast('Product created successfully.', 'success');
      }
      setFormOpen(false);
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error("[-] Form save error: ", err);
      triggerToast(err.response?.data?.detail || 'Failed to save product details.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm delete query execution
  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;
    setDeleteLoading(true);
    try {
      await itemService.deleteProduct(deleteItemId);
      triggerToast('Product deleted successfully.', 'success');
      setDeleteOpen(false);
      // Reset back to page 1 if delete leaves page empty
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchProducts();
      }
      fetchStats();
    } catch (err) {
      console.error("[-] Delete error: ", err);
      triggerToast('Failed to delete product.', 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteItemId(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090d16' }}>
      {/* 1. Collapsible Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
        handleCollapseToggle={handleCollapseToggle}
        isMobile={false} // Hook logic coordinates responsiveness
      />

      {/* 2. Primary Page Contents */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${isCollapsed ? 80 : 260}px)` },
          transition: 'width 0.2s ease-in-out',
          overflowY: 'auto'
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
                  fontFamily: "'Outfit', 'Inter', sans-serif"
                }}
              >
                Dashboard Overview
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', display: { xs: 'none', sm: 'block' } }}>
                Welcome back, {user?.name}! Manage your stock levels and catalog items.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClick}
            sx={{
              backgroundColor: '#4f46e5',
              '&:hover': { backgroundColor: '#4338ca' },
              borderRadius: '8px',
              px: { xs: 2, sm: 3 },
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            Add Product
          </Button>
        </Box>

        {/* 3. Analytics KPI Tiles */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Card 1: Total items count */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Products"
              value={stats.total_items}
              icon={<InventoryIcon />}
              iconBg="#3b82f6"
              subtitle="All registered items"
            />
          </Grid>

          {/* Card 2: Total stock valuation */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Stock Value"
              value={`$${new Intl.NumberFormat('en-US').format(stats.total_value)}`}
              icon={<ValueIcon />}
              iconBg="#10b981"
              subtitle="Cumulative catalog price"
            />
          </Grid>

          {/* Card 3: Low stock warning */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Low Stock Alert"
              value={stats.low_stock}
              icon={<WarningIcon />}
              iconBg="#f59e0b"
              subtitle="Quantity between 1 and 5"
              subtitleColor={stats.low_stock > 0 ? '#f59e0b' : '#64748b'}
            />
          </Grid>

          {/* Card 4: Out of stock counts */}
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Out of Stock"
              value={stats.out_of_stock}
              icon={<OutIcon />}
              iconBg="#ef4444"
              subtitle="Quantity equal to 0"
              subtitleColor={stats.out_of_stock > 0 ? '#ef4444' : '#64748b'}
            />
          </Grid>
        </Grid>

        {/* 4. Controls Action Row (Search / Filtering) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3
          }}
        >
          <TextField
            placeholder="Search by name, SKU, or category..."
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
              width: { xs: '100%', md: 350 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                borderColor: '#1f2633',
                '&:hover fieldset': { borderColor: '#475569' },
                '&.Mui-focused fieldset': { borderColor: '#4f46e5' }
              }
            }}
          />

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38bdf8' }}>
              <CircularProgress size={16} color="inherit" />
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>Syncing data...</Typography>
            </Box>
          )}
        </Box>

        {/* 5. Paginated, Sortable Grid Table */}
        <ItemTable
          items={items}
          total={total}
          page={page}
          size={size}
          onPageChange={setPage}
          onSizeChange={setSize}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          loading={loading}
        />
      </Box>

      {/* 6. Form Pop-up Dialog (Create/Edit Item) */}
      <ItemForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        item={selectedItem}
        loading={formLoading}
      />

      {/* 7. Action Confirm Deletion Dialog */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleteLoading && setDeleteOpen(false)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#b0b8c4' }}>
            Are you sure you want to permanently delete this product? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #1f2633', mt: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
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
            {deleteLoading ? <CircularProgress size={16} color="inherit" /> : 'Delete Product'}
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
