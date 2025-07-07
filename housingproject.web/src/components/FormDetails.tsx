import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup
} from '@mui/material';
import { 
  Close,
  Person,
  Home,
  Business,
  Calculate,
  DateRange,
  Description,
  CheckCircle,
  Cancel,
  Edit
} from '@mui/icons-material';

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
  reasonComments?: string;
  thirdPartyPaymentsVerified?: boolean;
  transactionScreenVerified?: boolean;
  overlappingHAP?: boolean;
  selectedType?: string;
  description?: string;
  dateIntendedToVacate?: string;
  signatureData?: string;
}

interface FormDetailsProps {
  form: MCRFormData | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (formId: number) => void;
  onReject?: (formId: number) => void;
}

const FormDetails: React.FC<FormDetailsProps> = ({ 
  form, 
  open, 
  onClose, 
  onApprove, 
  onReject 
}) => {
  if (!form) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getFullAddress = () => {
    const address = [form.addressLine1];
    if (form.addressLine2) address.push(form.addressLine2);
    address.push(`${form.city}, ${form.state} ${form.zipCode}`);
    return address.join(', ');
  };

  // Read-only field component that looks like a TextField
  const ReadOnlyField = ({ label, value, fullWidth = true }: { label: string; value: string | number; fullWidth?: boolean }) => (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          px: 2,
          py: 1.5,
          backgroundColor: '#f8f9fa',
          minHeight: '56px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '1rem',
          fontFamily: 'inherit'
        }}
      >
        {value || 'N/A'}
      </Box>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Description sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Manual Check Request Form - #{form.id}
          </Typography>
        </Box>
        <Chip 
          label={form.status} 
          color={getStatusColor(form.status) as any}
          sx={{ fontWeight: 600, color: '#ffffff' }}
        />
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <Box sx={{ p: 2.5 }}>
          {/* Employee Information Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                Employee Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <ReadOnlyField label="Housing Specialist Name" value={form.housingSpecialistName} />
              <ReadOnlyField label="Housing Specialist Email" value={form.housingSpecialistEmail || ''} />
              <ReadOnlyField label="Date" value={formatDate(form.submissionDate)} />
              <ReadOnlyField label="Program Type" value={form.programType || ''} />
              <ReadOnlyField label="Last 4 of SSN" value={form.lastFourSSN || ''} />
              <ReadOnlyField label="Tenant Name" value={form.tenantName} />
              <ReadOnlyField label="Owner Account Number" value={form.ownerAccountNumber || ''} />
            </Box>
          </Box>

          {/* Unit Address Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Home sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                Unit Address
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <ReadOnlyField label="Address Line 1" value={form.addressLine1} />
              <ReadOnlyField label="Address Line 2" value={form.addressLine2 || ''} />
              <ReadOnlyField label="City" value={form.city} />
              <ReadOnlyField label="State" value={form.state} />
              <ReadOnlyField label="Zip Code" value={form.zipCode} />
            </Box>
          </Box>

          {/* Landlord Information Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Business sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                Landlord Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <ReadOnlyField label="Landlord First Name" value={form.landlordFirstName || ''} />
              <ReadOnlyField label="Landlord Last Name" value={form.landlordLastName || ''} />
              <ReadOnlyField label="Effective Date" value={formatDate(form.effectiveDate)} />
            </Box>
          </Box>

          {/* HAP Calculation Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Calculate sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                HAP Calculation
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <ReadOnlyField label="HAP Amount" value={formatCurrency(form.hapAmount)} />
              <ReadOnlyField label="Date Intended to Vacate" value={form.dateIntendedToVacate ? formatDate(form.dateIntendedToVacate) : ''} />
              <ReadOnlyField label="Prorated Amount" value={form.proratedAmount ? formatCurrency(form.proratedAmount) : ''} />
            </Box>
          </Box>

          {/* Payment Covers Date Range Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <DateRange sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                Payment Covers Date Range
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <ReadOnlyField label="Start Date" value={formatDate(form.startDate)} />
              <ReadOnlyField label="End Date" value={formatDate(form.endDate)} />
            </Box>
          </Box>

          {/* Additional Information Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Edit sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                Additional Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Reason/Comments
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    px: 2,
                    py: 1.5,
                    backgroundColor: '#f8f9fa',
                    minHeight: '80px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                >
                  {form.reasonComments || 'N/A'}
                </Box>
              </Box>
              <ReadOnlyField label="Select MCR Type" value={form.mcrType} />
            </Box>
          </Box>

          {/* Verification and Type Selection */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 1.5, color: '#667eea', fontWeight: 600 }}>
                  Verification Checklist
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ 
                      color: form.thirdPartyPaymentsVerified ? '#667eea' : '#ccc',
                      fontSize: 20 
                    }} />
                    <Typography variant="body2">
                      Third Party Payments Verified?
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ 
                      color: form.transactionScreenVerified ? '#667eea' : '#ccc',
                      fontSize: 20 
                    }} />
                    <Typography variant="body2">
                      Transaction Screen Verified
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle sx={{ 
                      color: form.overlappingHAP ? '#667eea' : '#ccc',
                      fontSize: 20 
                    }} />
                    <Typography variant="body2">
                      Overlapping HAP?
                    </Typography>
                  </Box>
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 1.5, color: '#667eea', fontWeight: 600 }}>
                  Request Type
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio 
                      checked={form.selectedType === 'abatement'} 
                      disabled 
                      sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} 
                    />
                    <Typography variant="body2">Abatement</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio 
                      checked={form.selectedType === 'move'} 
                      disabled 
                      sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} 
                    />
                    <Typography variant="body2">Move</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio 
                      checked={form.selectedType === 'recoupment'} 
                      disabled 
                      sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} 
                    />
                    <Typography variant="body2">Recoupment/Overpayment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio 
                      checked={form.selectedType === 'underpayment'} 
                      disabled 
                      sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} 
                    />
                    <Typography variant="body2">Underpayment</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio 
                      checked={form.selectedType === 'other'} 
                      disabled 
                      sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} 
                    />
                    <Typography variant="body2">Other</Typography>
                  </Box>
                </Box>
                {form.selectedType === 'other' && form.description && (
                  <Box sx={{ mt: 2 }}>
                    <ReadOnlyField label="Description" value={form.description} />
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Signature Section */}
          {form.signatureData && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Description sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                  Digital Signature
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, color: '#667eea', fontWeight: 600 }}>
                  Housing Specialist Signature
                </Typography>
                <Box sx={{ 
                  border: '2px dashed #667eea', 
                  borderRadius: 2,
                  p: 1.5,
                  mb: 1.5,
                  bgcolor: '#f8f9fa',
                  minHeight: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={form.signatureData} 
                    alt="Digital Signature" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '150px',
                      objectFit: 'contain'
                    }} 
                  />
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          startIcon={<Close />}
          sx={{
            borderColor: '#667eea',
            color: '#667eea',
            '&:hover': {
              borderColor: '#5a6fd8',
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
            }
          }}
        >
          Close
        </Button>
        {form.status === 'Pending' && onApprove && onReject && (
          <>
            <Button 
              onClick={() => onApprove(form.id)}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              sx={{ fontWeight: 600 }}
            >
              Approve
            </Button>
            <Button 
              onClick={() => onReject(form.id)}
              variant="contained"
              color="error"
              startIcon={<Cancel />}
              sx={{ fontWeight: 600 }}
            >
              Reject
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FormDetails; 