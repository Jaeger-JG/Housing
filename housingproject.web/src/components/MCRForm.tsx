import React, { useRef, useEffect, useState } from 'react';
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
  Container,
  Divider
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Description, 
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

const housingSpecialists = [
  'Maria Munoz',
  'Rosanna Roldan',
  'Chevonne Dozier',
  'Kalunga Mumba',
  'Kristin Upshaw',
  'Ashley Johnson',
  'Allecca Consultants'
];

const programTypes = [
  'VASH',
  'PBV',
  'HCV'
];

const MCRForm: React.FC = () => {
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
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [landlordFirstName, setLandlordFirstName] = useState('');
  const [landlordLastName, setLandlordLastName] = useState('');
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
  const signatureRef = useRef<SignatureCanvas>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const calculateProratedAmount = () => {
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
  };

  useEffect(() => {
    calculateProratedAmount();
  }, [hapAmount, vacateDate]);

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.target.value);
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    console.log('Form submission started');
    
    // Check if signature is empty (the logic was inverted)
    if (signatureRef.current?.isEmpty()) {
      setSnackbar({
        open: true,
        message: 'Please provide a signature before submitting.',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Form is submitting...');

    try {
      // Fix the signature capture issue
      let signatureData = '';
      if (signatureRef.current && !signatureRef.current.isEmpty()) {
        try {
          // Use the regular canvas method instead of trimmed canvas
          signatureData = signatureRef.current.getCanvas().toDataURL('image/png');
        } catch (error) {
          console.warn('Could not get canvas data:', error);
          signatureData = '';
        }
      }
      
      console.log('Signature captured:', signatureData ? 'Yes' : 'No');

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
        ProratedAmount: proratedAmount,
        SignatureData: signatureData
      };

      console.log('Form data prepared:', formData);
      console.log('Sending request to: /api/MCR');

      // Production deployment with relative URLs
      const response = await fetch('/api/MCR', {
        method: 'POST',
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
          message: 'MCR form submitted successfully!',
          severity: 'success'
        });
        resetForm();
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
    setHousingSpecialistName('');
    setHousingSpecialistEmail('');
    setDate(new Date());
    setProgramType('');
    setLastFourSSN('');
    setTenantName('');
    setOwnerAccountNumber('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setZipCode('');
    setLandlordFirstName('');
    setLandlordLastName('');
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
    clearSignature();
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
      <Navbar onLogout={handleLogout} />
      
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
            Manual Check Request Form
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9 }}>
            Housing Choice Voucher (MCR) System
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
                select
                label="Housing Specialist Name"
                required
                value={housingSpecialistName}
                onChange={(e) => setHousingSpecialistName(e.target.value)}
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
                {housingSpecialists.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField 
                label="Housing Specialist Email" 
                required 
                type="email" 
                value={housingSpecialistEmail}
                onChange={(e) => setHousingSpecialistEmail(e.target.value)}
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
                label="Date"
                value={date}
                onChange={setDate}
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
              <TextField 
                label="Last 4 of SSN" 
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
                required 
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
                required 
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

          {/* Signature Section */}
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
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas',
                    style: {
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: 'transparent'
                    }
                  }}
                />
              </Box>
              <Button 
                variant="outlined" 
                size="medium" 
                onClick={clearSignature}
                sx={{ 
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a6fd8',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  }
                }}
              >
                Clear Signature
              </Button>
            </Paper>
          </Box>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
              {isSubmitting ? 'Submitting...' : 'Submit MCR Form'}
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