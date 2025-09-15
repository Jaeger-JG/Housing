import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  MenuItem, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  Radio, 
  RadioGroup, 
  Button, 
  Alert, 
  Snackbar,
  Paper,
  Divider
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Person, 
  Home, 
  Business, 
  Calculate, 
  DateRange,
  Edit,
  Send
} from '@mui/icons-material';
import Navbar from './Navbar';

const mcrTypes = [
  'HAP Portion',
  'Tenant Portion',
  'Both HAP and Tenant Portion'
];

// Helper function to convert username to proper name format
const formatUsernameToName = (username: string): string => {
  if (!username) return '';
  
  // Split by dots and capitalize each part
  const parts = username.split('.');
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

const programTypes = [
  'VASH',
  'PBV',
  'HCV'
];

interface MCRFormProps {
  editingFormData?: any;
  onFormSubmitted?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToFormsList?: () => void;
  onNavigateToReports?: () => void;
  onLogout?: () => void;
}

const MCRForm: React.FC<MCRFormProps> = ({ 
  editingFormData, 
  onFormSubmitted, 
  onNavigateToDashboard, 
  onNavigateToFormsList, 
  onNavigateToReports,
  onLogout 
}) => {
  // Form state
  const [housingSpecialistName, setHousingSpecialistName] = useState('');
  const [housingSpecialistEmail, setHousingSpecialistEmail] = useState('');
  const [date, setDate] = useState<Date | null>(new Date());
  const [programType, setProgramType] = useState('');
  const [lastFourSSN, setLastFourSSN] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [ownerAccountNumber, setOwnerAccountNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Vallejo');
  const [state, setState] = useState('California');
  const [zipCode, setZipCode] = useState('');
  const [landlordFirstName, setLandlordFirstName] = useState('');
  const [landlordLastName, setLandlordLastName] = useState('');
  const [entityName, setEntityName] = useState('');
  const [effectiveDate, setEffectiveDate] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reasonComments, setReasonComments] = useState('');
  const [mcrType, setMcrType] = useState('');
  const [thirdPartyPaymentsVerified, setThirdPartyPaymentsVerified] = useState(false);
  const [transactionScreenVerified, setTransactionScreenVerified] = useState(false);
  const [overlappingHAP, setOverlappingHAP] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [vacateDate, setVacateDate] = useState<Date | null>(null);
  const [hapAmount, setHapAmount] = useState<string>('');
  const [proratedAmount, setProratedAmount] = useState<number | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const calculateProratedAmount = useCallback(() => {
    if (!hapAmount || !vacateDate) {
      setProratedAmount(null);
      return;
    }

    const amount = parseFloat(hapAmount);
    if (isNaN(amount)) {
      setProratedAmount(null);
      return;
    }

    // Get the last day of the current month
    const lastDay = new Date(vacateDate.getFullYear(), vacateDate.getMonth() + 1, 0).getDate();
    const dailyRate = amount / lastDay;
    const daysToPay = vacateDate.getDate();
    const calculatedAmount = dailyRate * daysToPay;
    
    setProratedAmount(Number(calculatedAmount.toFixed(2)));
  }, [hapAmount, vacateDate]);

  useEffect(() => {
    calculateProratedAmount();
  }, [calculateProratedAmount]);

  // Auto-populate housing specialist fields based on logged-in user
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      const formattedName = formatUsernameToName(username);
      const email = `${username}@cityofvallejo.net`;
      setHousingSpecialistName(formattedName);
      setHousingSpecialistEmail(email);
    }
  }, []);

  // Populate form with editing data when editingFormData is provided
  useEffect(() => {
    if (editingFormData) {
      console.log('Populating form with editing data:', editingFormData);
      
      // Map API field names to form state
      setTenantName(editingFormData.tenantName || '');
      setAddressLine1(editingFormData.addressLine1 || '');
      setAddressLine2(editingFormData.addressLine2 || '');
      setCity(editingFormData.city || 'Vallejo');
      setState(editingFormData.state || 'California');
      setZipCode(editingFormData.zipCode || '');
      setLandlordFirstName(editingFormData.landlordFirstName || '');
      setLandlordLastName(editingFormData.landlordLastName || '');
      setEntityName(editingFormData.entityName || '');
      setOwnerAccountNumber(editingFormData.ownerAccountNumber || '');
      setProgramType(editingFormData.programType || '');
      setLastFourSSN(editingFormData.lastFourSSN || '');
      setMcrType(editingFormData.mcrType || '');
      setHapAmount(editingFormData.hapAmount?.toString() || '');
      setProratedAmount(editingFormData.proratedAmount || null);
      setReasonComments(editingFormData.reasonComments || '');
      setDescription(editingFormData.description || '');
      setSelectedType(editingFormData.selectedType || '');
      setThirdPartyPaymentsVerified(editingFormData.thirdPartyPaymentsVerified || false);
      setTransactionScreenVerified(editingFormData.transactionScreenVerified || false);
      setOverlappingHAP(editingFormData.overlappingHAP || false);
      
      // Set dates - handle both string and Date objects
      if (editingFormData.effectiveDate) {
        setEffectiveDate(new Date(editingFormData.effectiveDate));
      }
      if (editingFormData.startDate) {
        setStartDate(new Date(editingFormData.startDate));
      }
      if (editingFormData.endDate) {
        setEndDate(new Date(editingFormData.endDate));
      }
      if (editingFormData.dateIntendedToVacate) {
        setVacateDate(new Date(editingFormData.dateIntendedToVacate));
      }
      
      // Set the submission date
      if (editingFormData.date) {
        setDate(new Date(editingFormData.date));
      }
      
      // Set housing specialist info (these should be read-only but populate for consistency)
      if (editingFormData.housingSpecialistName) {
        setHousingSpecialistName(editingFormData.housingSpecialistName);
      }
      if (editingFormData.housingSpecialistEmail) {
        setHousingSpecialistEmail(editingFormData.housingSpecialistEmail);
      }
    }
  }, [editingFormData]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.target.value);
  };



  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log('Form submission started');

    // Check landlord information validation
    const hasEntityName = entityName.trim() !== '';
    const hasLandlordName = landlordFirstName.trim() !== '' && landlordLastName.trim() !== '';
    
    if (!hasEntityName && !hasLandlordName) {
      setSnackbar({
        open: true,
        message: 'Please provide either Entity Name or both Landlord First Name and Last Name.',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Form is submitting...');

    try {

      const formData = {
        // Remove any properties that might cause validation issues
        HousingSpecialistName: housingSpecialistName,
        HousingSpecialistEmail: housingSpecialistEmail,
        Date: date?.toISOString(),
        ProgramType: programType,
        LastFourSSN: lastFourSSN,
        TenantName: tenantName,
        OwnerAccountNumber: ownerAccountNumber,
        AddressLine1: addressLine1,
        AddressLine2: addressLine2,
        City: city,
        State: state,
        ZipCode: zipCode,
        LandlordFirstName: landlordFirstName,
        LandlordLastName: landlordLastName,
        EntityName: entityName,
        EffectiveDate: effectiveDate?.toISOString(),
        StartDate: startDate?.toISOString(),
        EndDate: endDate?.toISOString(),
        ReasonComments: reasonComments,
        MCRType: mcrType,
        ThirdPartyPaymentsVerified: thirdPartyPaymentsVerified,
        TransactionScreenVerified: transactionScreenVerified,
        OverlappingHAP: overlappingHAP,
        SelectedType: selectedType,
        Description: description,
        DateIntendedToVacate: vacateDate?.toISOString(),
        HAPAmount: parseFloat(hapAmount) || 0,
        ProratedAmount: proratedAmount
      };

      console.log('Form data prepared:', formData);
      
      // Determine if we're editing an existing form or creating a new one
      const isEditing = editingFormData && editingFormData.id;
      const url = isEditing 
        ? `https://housing-forms.cityofvallejo.net/api/MCR/${editingFormData.id}`
        : 'https://housing-forms.cityofvallejo.net/api/MCR';
      const method = isEditing ? 'PUT' : 'POST';
      
      console.log(`Sending ${method} request to: ${url}`);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Add credentials for Windows Auth
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        console.log('Form submitted successfully');
        setSnackbar({
          open: true,
          message: isEditing ? 'MCR form updated successfully!' : 'MCR form submitted successfully!',
          severity: 'success'
        });
        resetForm();
        
        // Call the onFormSubmitted callback if provided (for editing mode)
        if (onFormSubmitted) {
          onFormSubmitted();
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to submit form:', response.status, errorText);
        setSnackbar({
          open: true,
          message: `Failed to submit form: ${response.status} - ${errorText}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message: `Error submitting form: ${error}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    // Don't reset housing specialist fields - they should always be based on logged-in user
    setDate(new Date());
    setProgramType('');
    setLastFourSSN('');
    setTenantName('');
    setOwnerAccountNumber('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('Vallejo');
    setState('California');
    setZipCode('');
    setLandlordFirstName('');
    setLandlordLastName('');
    setEntityName('');
    setEffectiveDate(null);
    setStartDate(null);
    setEndDate(null);
    setReasonComments('');
    setMcrType('');
    setThirdPartyPaymentsVerified(false);
    setTransactionScreenVerified(false);
    setOverlappingHAP(false);
    setSelectedType('');
    setDescription('');
    setVacateDate(null);
    setHapAmount('');
    setProratedAmount(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
    // You can redirect to login page or clear session
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Navbar */}
      <Navbar 
        onLogout={onLogout || handleLogout} 
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToFormsList={onNavigateToFormsList}
        onNavigateToReports={onNavigateToReports}
      />
      
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 0.5,
        pt: 2,
        width: '100%',
        overflow: 'hidden',
        marginTop: '64px' // Account for fixed navbar
      }}>
        {/* Header */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 2, 
            mb: 1.5, 
            mx: 0.25,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
            {editingFormData ? 'Edit MCR Form' : 'Manual Check Request Form'}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9 }}>
            {editingFormData ? 'Update your rejected form' : 'Housing Choice Voucher (MCR) System'}
          </Typography>
        </Paper>

        <Paper 
          component="form" 
          onSubmit={handleSubmit} 
          elevation={2}
          sx={{ 
            p: 2.5,
            mx: 0.25,
            background: '#ffffff',
            borderRadius: 3,
            minHeight: 'calc(100vh - 120px)',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
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
              <TextField
                label="Housing Specialist Name"
                required
                value={housingSpecialistName}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Housing Specialist Email" 
                required 
                type="email" 
                value={housingSpecialistEmail}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <DatePicker
                label="Date of Request"
                value={date}
                onChange={setDate}
                minDate={new Date()}
                slotProps={{ 
                  textField: { 
                    required: true, 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }
                  } 
                }}
              />
              <TextField
                select
                label="Program Type"
                required
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                fullWidth
                sx={{
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
                {programTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

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
              <TextField 
                label="Address Line 1" 
                required 
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Address Line 2" 
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="City" 
                required 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="State" 
                required 
                value={state}
                onChange={(e) => setState(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Zip Code" 
                required 
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Tenant Information Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Person sx={{ fontSize: 24, color: '#667eea', mr: 1.5 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
                Tenant Information
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
              <TextField 
                label="Tenant Name" 
                required 
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Last 4 of Tenant SSN" 
                required 
                inputProps={{ maxLength: 4 }} 
                value={lastFourSSN}
                onChange={(e) => setLastFourSSN(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
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
              <TextField 
                label="Landlord First Name" 
                value={landlordFirstName}
                onChange={(e) => setLandlordFirstName(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Landlord Last Name" 
                value={landlordLastName}
                onChange={(e) => setLandlordLastName(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Entity Name" 
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField 
                label="Owner Account Number" 
                required 
                value={ownerAccountNumber}
                onChange={(e) => setOwnerAccountNumber(e.target.value)}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />

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
              <TextField 
                label="HAP Amount" 
                required 
                type="number"
                value={hapAmount}
                onChange={(e) => setHapAmount(e.target.value)}
                inputProps={{ step: "0.01" }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <DatePicker
                label="Date Intended to Vacate"
                value={vacateDate}
                onChange={setVacateDate}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }
                  } 
                }}
              />
              <DatePicker
                label="Effective Date"
                value={effectiveDate}
                onChange={setEffectiveDate}
                slotProps={{ 
                  textField: { 
                    required: true, 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }
                  } 
                }}
              />
              <TextField 
                label="Prorated Amount" 
                value={proratedAmount !== null ? proratedAmount.toFixed(2) : ''}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
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
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ 
                  textField: { 
                    required: true, 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }
                  } 
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ 
                  textField: { 
                    required: true, 
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#667eea',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea',
                        },
                      },
                    }
                  } 
                }}
              />
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
              <TextField 
                label="Reason/Comments" 
                fullWidth 
                multiline 
                minRows={3}
                value={reasonComments}
                onChange={(e) => setReasonComments(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <TextField
                label="Select MCR Type"
                select
                required
                value={mcrType}
                onChange={(e) => setMcrType(e.target.value)}
                fullWidth
                sx={{
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
                {mcrTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
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
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={thirdPartyPaymentsVerified}
                        onChange={(e) => setThirdPartyPaymentsVerified(e.target.checked)}
                        sx={{
                          color: '#667eea',
                          '&.Mui-checked': {
                            color: '#667eea',
                          },
                        }}
                      />
                    } 
                    label="Third Party Payments Verified?" 
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={transactionScreenVerified}
                        onChange={(e) => setTransactionScreenVerified(e.target.checked)}
                        sx={{
                          color: '#667eea',
                          '&.Mui-checked': {
                            color: '#667eea',
                          },
                        }}
                      />
                    } 
                    label="Transaction Screen Verified" 
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={overlappingHAP}
                        onChange={(e) => setOverlappingHAP(e.target.checked)}
                        sx={{
                          color: '#667eea',
                          '&.Mui-checked': {
                            color: '#667eea',
                          },
                        }}
                      />
                    } 
                    label="Overlapping HAP?" 
                  />
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                <Typography variant="h6" sx={{ mb: 1.5, color: '#667eea', fontWeight: 600 }}>
                  Request Type
                </Typography>
                <RadioGroup
                  value={selectedType}
                  onChange={handleTypeChange}
                >
                  <FormControlLabel 
                    value="abatement" 
                    control={<Radio sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} />} 
                    label="Abatement" 
                  />
                  <FormControlLabel 
                    value="move" 
                    control={<Radio sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} />} 
                    label="Move" 
                  />
                  <FormControlLabel 
                    value="recoupment" 
                    control={<Radio sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} />} 
                    label="Recoupment/Overpayment" 
                  />
                  <FormControlLabel 
                    value="underpayment" 
                    control={<Radio sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} />} 
                    label="Underpayment" 
                  />
                  <FormControlLabel 
                    value="other" 
                    control={<Radio sx={{ color: '#667eea', '&.Mui-checked': { color: '#667eea' } }} />} 
                    label="Other" 
                  />
                </RadioGroup>
                {selectedType === 'other' && (
                  <TextField
                    label="Description"
                    multiline
                    minRows={2}
                    fullWidth
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
              </Paper>
            </Box>
          </Box>


          {/* Submit and Clear Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button 
              type="button"
              variant="outlined" 
              onClick={resetForm}
              disabled={isSubmitting}
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                px: 4,
                py: 1.2,
                fontSize: '1rem',
                borderRadius: 2.5,
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.2)',
                },
                '&:disabled': {
                  borderColor: '#ccc',
                  color: '#ccc',
                  transform: 'none',
                  boxShadow: 'none',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Clear Form
            </Button>
            <Button 
              type="submit"
              variant="contained" 
              disabled={isSubmitting}
              startIcon={<Send />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 5,
                py: 1.2,
                fontSize: '1rem',
                borderRadius: 2.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                },
                '&:disabled': {
                  background: '#ccc',
                  transform: 'none',
                  boxShadow: 'none',
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isSubmitting ? (editingFormData ? 'Updating...' : 'Submitting...') : (editingFormData ? 'Update MCR Form' : 'Submit MCR Form')}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            '& .MuiAlert-icon': {
              color: snackbar.severity === 'success' ? '#667eea' : undefined
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default MCRForm; 