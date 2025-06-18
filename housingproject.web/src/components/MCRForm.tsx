import React, { useRef, useEffect } from 'react';
import { Box, TextField, MenuItem, Typography, FormControlLabel, Checkbox, Radio, RadioGroup, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SignatureCanvas from 'react-signature-canvas';

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
  const [date, setDate] = React.useState<Date | null>(new Date());
  const [effectiveDate, setEffectiveDate] = React.useState<Date | null>(null);
  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [vacateDate, setVacateDate] = React.useState<Date | null>(null);
  const [hapAmount, setHapAmount] = React.useState<string>('');
  const [proratedAmount, setProratedAmount] = React.useState<number | null>(null);
  const signatureRef = useRef<SignatureCanvas>(null);

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

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" sx={{ 
        mt: 8,
        width: '100%'
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>HOUSING CHOICE VOUCHER</Typography>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>MANUAL CHECK REQUEST FORM (MCR)</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Employee Information */}
          <Box>
            <Typography variant="subtitle1">Employee Information</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Housing Specialist Name"
                required
                sx={{ flex: '1 1 300px' }}
                defaultValue=""
              >
                {housingSpecialists.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Housing Specialist Email" required type="email" sx={{ flex: '1 1 300px' }} />
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={setDate}
                  slotProps={{ textField: { required: true, fullWidth: true } }}
                />
              </Box>
              <TextField
                select
                label="Program Type"
                required
                sx={{ flex: '1 1 300px' }}
                defaultValue=""
              >
                {programTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Last 4 of SSN" required inputProps={{ maxLength: 4 }} sx={{ flex: '1 1 300px' }} />
              <TextField label="Tenant Name" required sx={{ flex: '1 1 300px' }} />
              <TextField label="Owner Account Number" required sx={{ flex: '1 1 300px' }} />
            </Box>
          </Box>

          {/* Unit Address */}
          <Box>
            <Typography variant="subtitle1">Unit Address</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <TextField label="Address Line 1" required sx={{ flex: '1 1 300px' }} />
              <TextField label="Address Line 2" sx={{ flex: '1 1 300px' }} />
              <TextField label="City" required sx={{ flex: '1 1 200px' }} />
              <TextField label="State" required sx={{ flex: '1 1 200px' }} />
              <TextField label="ZIP Code" required sx={{ flex: '1 1 200px' }} />
            </Box>
          </Box>

          {/* Landlord Information */}
          <Box>
            <Typography variant="subtitle1">Landlord Information</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <TextField label="Landlord First Name" required sx={{ flex: '1 1 300px' }} />
              <TextField label="Landlord Last Name" required sx={{ flex: '1 1 300px' }} />
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="Effective Date"
                  value={effectiveDate}
                  onChange={setEffectiveDate}
                  slotProps={{ textField: { required: true, fullWidth: true } }}
                />
              </Box>
            </Box>
          </Box>

          {/* HAP Calculation */}
          <Box>
            <Typography variant="subtitle1">HAP Calculation</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <TextField 
                label="HAP Amount" 
                required 
                type="number"
                value={hapAmount}
                onChange={(e) => setHapAmount(e.target.value)}
                inputProps={{ step: "0.01" }}
                sx={{ flex: '1 1 300px' }} 
              />
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="Date Intended to Vacate"
                  value={vacateDate}
                  onChange={setVacateDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
              <TextField 
                label="Prorated Amount" 
                value={proratedAmount !== null ? proratedAmount.toFixed(2) : ''}
                InputProps={{
                  readOnly: true,
                }}
                sx={{ flex: '1 1 300px' }} 
              />
            </Box>
          </Box>

          {/* Payment Covers Date Range */}
          <Box>
            <Typography variant="subtitle1">Payment Covers Date Range</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { required: true, fullWidth: true } }}
                />
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { required: true, fullWidth: true } }}
                />
              </Box>
            </Box>
          </Box>

          <TextField label="Reason/Comments" fullWidth multiline minRows={2} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Select MCR Type"
              select
              required
              sx={{ flex: '1 1 300px' }}
              defaultValue=""
            >
              {mcrTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <FormControlLabel control={<Checkbox />} label="Third Party Payments Verified?" />
              <FormControlLabel control={<Checkbox />} label="Transaction Screen Verified" />
              <FormControlLabel control={<Checkbox />} label="Overlapping HAP?" />
              <RadioGroup
                value={selectedType}
                onChange={handleTypeChange}
                sx={{ mt: 2 }}
              >
                <FormControlLabel value="abatement" control={<Radio />} label="Abatement" />
                <FormControlLabel value="move" control={<Radio />} label="Move" />
                <FormControlLabel value="recoupment" control={<Radio />} label="Recoupment/Overpayment" />
                <FormControlLabel value="underpayment" control={<Radio />} label="Underpayment" />
                <FormControlLabel value="other" control={<Radio />} label="Other" />
              </RadioGroup>
              {selectedType === 'other' && (
                <TextField
                  label="Description"
                  multiline
                  minRows={2}
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
            <Box sx={{ flex: '1 1 300px' }}>
              <Typography variant="subtitle2" gutterBottom>Housing Specialist Signature</Typography>
              <Box sx={{ 
                border: '1px solid #ccc', 
                borderRadius: 1,
                p: 1,
                mb: 1,
                bgcolor: 'white'
              }}>
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'signature-canvas'
                  }}
                />
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={clearSignature}
                sx={{ mb: 2 }}
              >
                Clear Signature
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" color="primary">Submit</Button>
          </Box>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default MCRForm; 