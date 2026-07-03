// src/components/ItemTable.jsx
// Purpose: Paginated and sortable table with inline edit/delete commands and loading skeletons.

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
  Typography,
  Box
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory2Outlined as EmptyIcon
} from '@mui/icons-material';

/**
 * Format price as currency.
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

/**
 * Get color scheme for inventory status chips.
 */
const getStatusStyles = (status) => {
  switch (status) {
    case 'In Stock':
      return {
        color: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        boxShadow: '0 0 8px rgba(16, 185, 129, 0.1)'
      };
    case 'Low Stock':
      return {
        color: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        boxShadow: '0 0 8px rgba(245, 158, 11, 0.1)'
      };
    case 'Out of Stock':
      return {
        color: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        boxShadow: '0 0 8px rgba(239, 68, 68, 0.1)'
      };
    default:
      return { color: '#94a3b8', backgroundColor: 'rgba(148, 163, 184, 0.1)' };
  }
};

export default function ItemTable({
  items,
  total,
  page,
  size,
  onPageChange,
  onSizeChange,
  sortBy,
  sortDir,
  onSortChange,
  onEdit,
  onDelete,
  loading
}) {
  const handleSort = (property) => {
    const isAsc = sortBy === property && sortDir === 'asc';
    onSortChange(property, isAsc ? 'desc' : 'asc');
  };

  // Columns definition: id, label, sortable flag
  const columns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'sku', label: 'SKU', sortable: true },
    { id: 'category', label: 'Category', sortable: true },
    { id: 'price', label: 'Price', sortable: true },
    { id: 'quantity', label: 'Stock Qty', sortable: true },
    { id: 'status', label: 'Status', sortable: false },
    { id: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <Paper
      sx={{
        width: '100%',
        overflow: 'hidden',
        background: 'rgba(17, 24, 39, 0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}
    >
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          {/* Table Headers */}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    backgroundColor: '#111827',
                    color: '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderBottom: '1px solid #1f2633',
                    py: 2
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortDir : 'asc'}
                      onClick={() => handleSort(col.id)}
                      sx={{
                        color: '#94a3b8 !important',
                        '& .MuiTableSortLabel-icon': {
                          color: '#38bdf8 !important'
                        }
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {loading ? (
              // Skeleton rows when loading
              Array.from(new Array(size)).map((_, index) => (
                <TableRow key={index} hover>
                  {columns.map((col, cIdx) => (
                    <TableCell key={cIdx} sx={{ borderBottom: '1px solid #1f2633', py: 2 }}>
                      <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <EmptyIcon sx={{ fontSize: 48, color: '#475569' }} />
                    <Typography variant="body1" sx={{ color: '#64748b', fontWeight: 500 }}>
                      No inventory items found. Add a new product to get started.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Real data rows
              items.map((item) => (
                <TableRow
                  key={item.id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.02) !important'
                    }
                  }}
                >
                  {/* Name */}
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid #1f2633', py: 1.5, fontWeight: 500 }}>
                    {item.name}
                  </TableCell>

                  {/* SKU */}
                  <TableCell sx={{ color: '#b0b8c4', borderBottom: '1px solid #1f2633', py: 1.5 }}>
                    <code style={{ color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#0f172a' }}>
                      {item.sku}
                    </code>
                  </TableCell>

                  {/* Category */}
                  <TableCell sx={{ color: '#b0b8c4', borderBottom: '1px solid #1f2633', py: 1.5 }}>
                    {item.category}
                  </TableCell>

                  {/* Price */}
                  <TableCell sx={{ color: '#f59e0b', borderBottom: '1px solid #1f2633', py: 1.5, fontWeight: 600 }}>
                    {formatPrice(item.price)}
                  </TableCell>

                  {/* Quantity */}
                  <TableCell sx={{ color: '#fff', borderBottom: '1px solid #1f2633', py: 1.5 }}>
                    {item.quantity}
                  </TableCell>

                  {/* Status Chip */}
                  <TableCell sx={{ borderBottom: '1px solid #1f2633', py: 1.5 }}>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        ...getStatusStyles(item.status)
                      }}
                    />
                  </TableCell>

                  {/* Action buttons (Edit/Delete) */}
                  <TableCell sx={{ borderBottom: '1px solid #1f2633', py: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(item)}
                          sx={{
                            color: '#3b82f6',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#60a5fa'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(item.id)}
                          sx={{
                            color: '#f43f5e',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            '&:hover': {
                              backgroundColor: 'rgba(244, 63, 94, 0.1)',
                              color: '#fb7185'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={size}
        page={page - 1} // MUI uses 0-indexed page count
        onPageChange={(event, newPage) => onPageChange(newPage + 1)} // Our API uses 1-indexed count
        onRowsPerPageChange={(event) => {
          onSizeChange(parseInt(event.target.value, 10));
          onPageChange(1); // Reset to page 1 on resize
        }}
        sx={{
          color: '#94a3b8',
          borderTop: '1px solid #1f2633',
          '& .MuiTablePagination-selectIcon': {
            color: '#94a3b8'
          },
          '& .MuiIconButton-root': {
            color: '#94a3b8',
            '&.Mui-disabled': {
              color: '#334155'
            }
          }
        }}
      />
    </Paper>
  );
}
