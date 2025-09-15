import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import { 
  ArrowBack, 
  Search, 
  Description, 
  CalendarToday,
  Visibility
} from '@mui/icons-material';
import FormDetails from './FormDetails';

interface MCRFormData {
  id: number;
  tenantName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  submissionDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'InReview';
  hapAmount: number;
  proratedAmount?: number;
  housingSpecialistName: string;
  mcrType: string;
  effectiveDate: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  // Additional fields for detailed view
  housingSpecialistEmail?: string;
  programType?: string;
  lastFourSSN?: string;
  ownerAccountNumber?: string;
  landlordFirstName?: string;
  landlordLastName?: string;
  entityName?: string;
  reasonComments?: string;
  thirdPartyPaymentsVerified?: boolean;
  transactionScreenVerified?: boolean;
  overlappingHAP?: boolean;
  selectedType?: string;
  description?: string;
  dateIntendedToVacate?: string;
  signatureData?: string;
  isUpdating?: boolean; // Added for loading state
}

interface FormsListProps {
  onNavigateBack: () => void;
}

const FormsList: React.FC<FormsListProps> = ({ onNavigateBack }) => {
  const [forms, setForms] = useState<MCRFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<MCRFormData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formToReject, setFormToReject] = useState<MCRFormData | null>(null);

  // Authorized users who can approve/reject forms
  const authorizedUsers = [
    'justin.grier',
    'alicia.jones', 
    'chari.francisco',
    'shenessa.williams'
  ];

  // Check if current user is authorized to approve/reject forms
  const isUserAuthorized = () => {
    const currentUser = localStorage.getItem('username');
    return currentUser && authorizedUsers.includes(currentUser.toLowerCase());
  };

  // Handle rejection dialog
  const handleRejectClick = (form: MCRFormData) => {
    setFormToReject(form);
    setRejectionReason('');
    setRejectionDialogOpen(true);
  };

  const handleRejectionDialogClose = () => {
    setRejectionDialogOpen(false);
    setFormToReject(null);
    setRejectionReason('');
  };

  const handleRejectionSubmit = async () => {
    if (formToReject && rejectionReason.trim()) {
      await updateFormStatus(formToReject.id, 'Rejected');
      handleRejectionDialogClose();
    }
  };

  // Fetch forms from API
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://housing-forms.cityofvallejo.net/api/MCR', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Add credentials for Windows Auth
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch forms:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Transform the API data to match our interface
        const transformedForms: MCRFormData[] = data.map((form: any) => ({
          id: form.id,
          tenantName: form.tenantName,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          submissionDate: form.date,
          status: typeof form.status === 'number' ? 
            ['Pending', 'Approved', 'Rejected', 'InReview'][form.status] || 'Pending' :
            form.status || 'Pending',
          hapAmount: form.hapAmount,
          proratedAmount: form.proratedAmount,
          housingSpecialistName: form.housingSpecialistName,
          mcrType: form.mcrType,
          effectiveDate: form.effectiveDate,
          startDate: form.startDate,
          endDate: form.endDate,
          createdAt: form.createdAt,
          // Additional fields for detailed view
          housingSpecialistEmail: form.housingSpecialistEmail,
          programType: form.programType,
          lastFourSSN: form.lastFourSSN,
          ownerAccountNumber: form.ownerAccountNumber,
          landlordFirstName: form.landlordFirstName,
          landlordLastName: form.landlordLastName,
          entityName: form.entityName,
          reasonComments: form.reasonComments,
          thirdPartyPaymentsVerified: form.thirdPartyPaymentsVerified,
          transactionScreenVerified: form.transactionScreenVerified,
          overlappingHAP: form.overlappingHAP,
          selectedType: form.selectedType,
          description: form.description,
          dateIntendedToVacate: form.dateIntendedToVacate,
          signatureData: form.signatureData
        }));

        setForms(transformedForms);
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Failed to load forms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const getStatusColor = (status: string | number) => {
    // Convert to string if it's a number
    const statusStr = typeof status === 'number' ? 
      ['Pending', 'Approved', 'Rejected', 'InReview'][status] || 'Pending' :
      String(status);
    
    switch (statusStr.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inreview':
      case 'in review':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredForms = forms.filter(form => {
    const statusStr = typeof form.status === 'number' ? 
      ['Pending', 'Approved', 'Rejected', 'InReview'][form.status] || 'Pending' :
      String(form.status);
    
    // Status filter
    if (statusFilter !== 'All' && statusStr !== statusFilter) {
      return false;
    }
    
    // Search term filter
    return form.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${form.addressLine1} ${form.city} ${form.state}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      statusStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.housingSpecialistName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getFullAddress = (form: MCRFormData) => {
    const address = [form.addressLine1];
    if (form.addressLine2) address.push(form.addressLine2);
    address.push(`${form.city}, ${form.state} ${form.zipCode}`);
    return address.join(', ');
  };

  const handleViewDetails = (form: MCRFormData) => {
    setSelectedForm(form);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedForm(null);
  };

  const updateFormStatus = async (formId: number, newStatus: MCRFormData['status']) => {
    try {
      console.log(`Updating form ${formId} status to ${newStatus}`);
      
      // Show loading state immediately
      setForms(prevForms => 
        prevForms.map(form => 
          form.id === formId 
            ? { ...form, isUpdating: true }
            : form
        )
      );

      const response = await fetch(`https://housing-forms.cityofvallejo.net/api/MCR/${formId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add credentials for Windows Auth
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Status update response:', response.status, response.statusText);

      if (response.ok) {
        console.log('Status updated successfully');
        
        // Update the local state immediately for instant UI feedback
        setForms(prevForms => 
          prevForms.map(form => 
            form.id === formId 
              ? { ...form, status: newStatus, isUpdating: false }
              : form
          )
        );

        // Show success message
        setError(null); // Clear any existing errors
        
      } else {
        const errorText = await response.text();
        console.error('Failed to update status:', response.status, errorText);
        
        // Revert the loading state and show error
        setForms(prevForms => 
          prevForms.map(form => 
            form.id === formId 
              ? { ...form, isUpdating: false }
              : form
          )
        );
        
        setError(`Failed to update status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      
      // Revert the loading state and show error
      setForms(prevForms => 
        prevForms.map(form => 
          form.id === formId 
            ? { ...form, isUpdating: false }
            : form
        )
      );
      
      setError(`Error updating status: ${error}`);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      pt: 2,
      width: '100%',
      overflow: 'hidden'
    }}>
      <Box sx={{ px: 0.25, width: '100%' }}>
        {/* Header */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 3, 
            mb: 1.5,
            mx: 0.25,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton 
              onClick={onNavigateBack}
              sx={{ color: '#ffffff' }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              MCR Forms Database
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9 }}>
            View and manage all submitted Manual Check Request forms
          </Typography>
        </Paper>

        {/* Search and Filters */}
        <Paper elevation={2} sx={{ p: 2.5, mb: 1.5, mx: 0.25 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by tenant name, address, status, or housing specialist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Filter by Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                  },
                },
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
              <MenuItem value="InReview">In Review</MenuItem>
            </TextField>
            {(searchTerm || statusFilter !== 'All') && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('All');
                }}
                sx={{
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </Paper>

        {/* Forms Table */}
        <Paper elevation={2} sx={{ overflow: 'hidden', mx: 0.25, minHeight: 'calc(100vh - 280px)' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Form ID</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Housing Specialist</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Property Address</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Submission Date</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>HAP Amount</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Prorated Amount</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography>Loading forms...</Typography>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="error">{error}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="textSecondary">
                        {forms.length === 0 ? 'No forms have been submitted yet.' : 'No forms found matching your search criteria.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredForms.map((form) => (
                    <TableRow 
                      key={form.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(102, 126, 234, 0.05)' 
                        } 
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Description sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography fontWeight={500}>#{form.id}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{form.housingSpecialistName}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {form.tenantName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {getFullAddress(form)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16, color: '#667eea' }} />
                          <Typography variant="body2">
                            {formatDate(form.submissionDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          {formatCurrency(form.hapAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>
                          {form.proratedAmount ? formatCurrency(form.proratedAmount) : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={typeof form.status === 'number' ? 
                            ['Pending', 'Approved', 'Rejected', 'InReview'][form.status] || 'Pending' :
                            form.status} 
                          color={getStatusColor(form.status) as any}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(form)}
                            sx={{
                              borderColor: '#667eea',
                              color: '#667eea',
                              '&:hover': {
                                borderColor: '#5a6fd8',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              }
                            }}
                          >
                            View Details
                          </Button>
                          {form.status === 'Pending' && (
                            <>
                              {isUserAuthorized() ? (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="success"
                                    onClick={() => updateFormStatus(form.id, 'Approved')}
                                    disabled={form.isUpdating}
                                    sx={{ fontSize: '0.7rem', px: 1 }}
                                    startIcon={form.isUpdating ? <CircularProgress size={16} color="inherit" /> : undefined}
                                  >
                                    {form.isUpdating ? 'Updating...' : 'Approve'}
                                  </Button>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    color="error"
                                    onClick={() => handleRejectClick(form)}
                                    disabled={form.isUpdating}
                                    sx={{ fontSize: '0.7rem', px: 1 }}
                                    startIcon={form.isUpdating ? <CircularProgress size={16} color="inherit" /> : undefined}
                                  >
                                    {form.isUpdating ? 'Updating...' : 'Reject'}
                                  </Button>
                                </Box>
                              ) : (
                                <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
                                  View only
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Summary Stats */}
        <Paper elevation={2} sx={{ p: 2.5, mt: 1.5, mx: 0.25 }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" color="primary" fontWeight={600}>
                {filteredForms.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchTerm || statusFilter !== 'All' ? 'Filtered Forms' : 'Total Forms'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="success.main" fontWeight={600}>
                {forms.filter(f => {
                  const status = typeof f.status === 'number' ? 
                    ['Pending', 'Approved', 'Rejected', 'InReview'][f.status] || 'Pending' :
                    String(f.status);
                  return status.toLowerCase() === 'approved';
                }).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Approved
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="warning.main" fontWeight={600}>
                {forms.filter(f => {
                  const status = typeof f.status === 'number' ? 
                    ['Pending', 'Approved', 'Rejected', 'InReview'][f.status] || 'Pending' :
                    String(f.status);
                  return status.toLowerCase() === 'pending';
                }).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="info.main" fontWeight={600}>
                {forms.filter(f => {
                  const status = typeof f.status === 'number' ? 
                    ['Pending', 'Approved', 'Rejected', 'InReview'][f.status] || 'Pending' :
                    String(f.status);
                  return status.toLowerCase() === 'in review';
                }).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                In Review
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Form Details Dialog */}
      <FormDetails
        form={selectedForm}
        open={detailsOpen}
        onClose={handleCloseDetails}
        onApprove={(formId) => {
          updateFormStatus(formId, 'Approved');
          handleCloseDetails();
        }}
        onReject={(formId, reason) => {
          updateFormStatus(formId, 'Rejected');
          handleCloseDetails();
          // Note: The rejection reason is captured but not currently stored in the database
          // This could be enhanced to store the reason in a future update
          if (reason) {
            console.log(`Form ${formId} rejected with reason: ${reason}`);
          }
        }}
      />

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialogOpen}
        onClose={handleRejectionDialogClose}
        aria-labelledby="rejection-dialog-title"
        aria-describedby="rejection-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="rejection-dialog-title">
          Reject MCR Form
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="rejection-dialog-description" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this form. This information will be recorded and may be shared with the housing specialist.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter the reason for rejection..."
            required
            error={!rejectionReason.trim()}
            helperText={!rejectionReason.trim() ? "Rejection reason is required" : ""}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleRejectionDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleRejectionSubmit} 
            color="error" 
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Reject Form
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormsList; 