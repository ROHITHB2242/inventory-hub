// src/components/ItemForm.jsx
// Purpose: Dialog pop-up form facilitating product creation and modification with validations.

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Grid,
  InputAdornment,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';

// Predefined categories for inventory grouping
const CATEGORIES = [
  'Electronics',
  'Apparel',
  'Home & Kitchen',
  'Books & Media',
  'Office Supplies',
  'Automotive',
  'Health & Wellness',
  'Food & Beverages'
];

const initialFormState = {
  name: '',
  sku: '',
  category: '',
  price: '',
  quantity: '',
  description: ''
};

export default function ItemForm({ open, onClose, onSubmit, item, loading }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // Reset or load product data when dialog opens/item changes
  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          name: item.name || '',
          sku: item.sku || '',
          category: item.category || '',
          price: item.price || '',
          quantity: item.quantity || '',
          description: item.description || ''
        });
      } else {
        setForm(initialFormState);
      }
      setErrors({});
    }
  }, [open, item]);

  // Handle text field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user edits the field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Perform client-side constraints validation
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Product name is required.';
    } else if (form.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters.';
    }

    if (!form.sku.trim()) {
      newErrors.sku = 'SKU code is required.';
    } else if (form.sku.trim().length < 3) {
      newErrors.sku = 'SKU code must be at least 3 characters.';
    }

    if (!form.category) {
      newErrors.category = 'Category must be selected.';
    }

    const priceNum = parseFloat(form.price);
    if (form.price === '' || isNaN(priceNum)) {
      newErrors.price = 'Price is required.';
    } else if (priceNum <= 0) {
      newErrors.price = 'Price must be a positive number.';
    }

    const qtyNum = parseInt(form.quantity, 10);
    if (form.quantity === '' || isNaN(qtyNum)) {
      newErrors.quantity = 'Stock quantity is required.';
    } else if (qtyNum < 0) {
      newErrors.quantity = 'Quantity cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Dispatch details on submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Cast values to required types
    const submissionData = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
      description: form.description.trim()
    };

    onSubmit(submissionData);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#111827',
          color: '#fff',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', borderBottom: '1px solid #1f2633', pb: 2 }}>
        {item ? 'Modify Product Details' : 'Register New Product'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Product Name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
              />
            </Grid>

            {/* SKU */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="sku"
                label="SKU Code"
                value={form.sku}
                onChange={handleChange}
                fullWidth
                error={!!errors.sku}
                helperText={errors.sku}
                variant="outlined"
                disabled={loading}
                placeholder="E.G. LAP-DELL-XPS"
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
              />
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                name="category"
                label="Category"
                value={form.category}
                onChange={handleChange}
                fullWidth
                error={!!errors.category}
                helperText={errors.category}
                variant="outlined"
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="price"
                label="Unit Price"
                type="number"
                value={form.price}
                onChange={handleChange}
                fullWidth
                error={!!errors.price}
                helperText={errors.price}
                variant="outlined"
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: '0.01', min: '0.01' }}
                InputProps={{
                  startAdornment: <InputAdornment position="start" sx={{ '& p': { color: '#64748b' } }}>$</InputAdornment>,
                  style: { backgroundColor: '#0f172a' }
                }}
              />
            </Grid>

            {/* Quantity */}
            <Grid item xs={12} sm={6}>
              <TextField
                name="quantity"
                label="Initial Quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                fullWidth
                error={!!errors.quantity}
                helperText={errors.quantity}
                variant="outlined"
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: '0' }}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Product Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#0f172a' } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #1f2633', p: 2, mt: 1 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              color: '#94a3b8',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: '#4f46e5',
              '&:hover': { backgroundColor: '#4338ca' },
              borderRadius: '8px',
              px: 3,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>Saving...</span>
              </Box>
            ) : item ? (
              'Save Changes'
            ) : (
              'Add Product'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
