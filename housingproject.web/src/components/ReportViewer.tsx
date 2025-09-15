import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Chip,
  IconButton,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description,
  Assignment,
  Notifications,
  Settings,
  ArrowBack,
  Assessment,
  Search,
  Download,
  FilterList,
  Warning,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

interface ReportViewerProps {
  reportType: string;
  onNavigateBack: () => void;
  onNavigateToForm: () => void;
  onNavigateToFormsList: () => void;
  onNavigateToDashboard: () => void;
  onLogout?: () => void;
  username?: string;
}

const drawerWidth = 280;

const ReportViewer: React.FC<ReportViewerProps> = ({
  reportType,
  onNavigateBack,
  onNavigateToForm,
  onNavigateToFormsList,
  onNavigateToDashboard,
  onLogout,
  username
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [filteredForms, setFilteredForms] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [specialistFilter, setSpecialistFilter] = useState('all');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  // Generate sample notifications
  useEffect(() => {
    const sampleNotifications = [
      { id: 1, type: 'info', message: 'Report data refreshed', time: '2 hours ago' },
      { id: 2, type: 'warning', message: 'Some forms pending review', time: '1 day ago' },
      { id: 3, type: 'success', message: 'Report exported successfully', time: '2 days ago' }
    ];
    setNotifications(sampleNotifications);
  }, []);

  // Fetch forms data based on report type
  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('https://housing-forms.cityofvallejo.net/api/MCR');
        if (!response.ok) {
          throw new Error('Failed to fetch forms');
        }
        
        const data = await response.json();
        setForms(data);
        setFilteredForms(data);
      } catch (err) {
        setError('Failed to load report data. Please try again.');
        console.error('Error fetching forms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [reportType]);

  // Filter forms based on search and filters
  useEffect(() => {
    let filtered = forms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(form => 
        form.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.addressLine1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.housingSpecialistName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(form => {
        const status = form.status;
        if (statusFilter === 'pending') return status === 0;
        if (statusFilter === 'approved') return status === 1;
        if (statusFilter === 'rejected') return status === 2;
        return true;
      });
    }

    // Specialist filter
    if (specialistFilter !== 'all') {
      filtered = filtered.filter(form => 
        form.housingSpecialistName === specialistFilter
      );
    }

    setFilteredForms(filtered);
    setPage(0); // Reset to first page when filters change
  }, [forms, searchTerm, statusFilter, specialistFilter]);

  const getStatusChip = (status: number) => {
    const statusMap = {
      0: { label: 'Pending', color: '#ff9800' },
      1: { label: 'Approved', color: '#4caf50' },
      2: { label: 'Rejected', color: '#f44336' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: 'Unknown', color: '#9e9e9e' };
    
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        sx={{
          backgroundColor: `${statusInfo.color}20`,
          color: statusInfo.color,
          fontWeight: 500,
        }}
      />
    );
  };

  const getReportTitle = () => {
    const titles = {
      'mcr-summary': 'MCR Form Summary Report',
      'rejected-forms': 'Rejected Forms Analysis Report',
      'form-approvals': 'Form Approval Report'
    };
    return titles[reportType as keyof typeof titles] || 'Report';
  };

  const getReportDescription = () => {
    const descriptions = {
      'mcr-summary': 'Complete overview of all MCR forms with status breakdown and filtering options',
      'rejected-forms': 'Detailed analysis of rejected forms and common issues',
      'form-approvals': 'Comprehensive approval workflow and processing times'
    };
    return descriptions[reportType as keyof typeof descriptions] || 'Report data';
  };

  const handleDownloadExcel = () => {
    // Create CSV data
    const headers = [
      'Form ID',
      'Tenant Name',
      'Property Address',
      'Program Type',
      'Status',
      'Housing Specialist',
      'Created Date',
      'Amount'
    ];

    const csvData = filteredForms.map(form => [
      form.id,
      form.tenantName || '',
      `${form.addressLine1 || ''} ${form.addressLine2 || ''} ${form.city || ''} ${form.state || ''} ${form.zipCode || ''}`.trim(),
      form.programType || '',
      getStatusChip(form.status).props.label,
      form.housingSpecialistName || '',
      form.createdAt ? new Date(form.createdAt).toLocaleDateString() : '',
      form.hapAmount ? `$${parseFloat(form.hapAmount).toFixed(2)}` : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${getReportTitle().toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadRejectionAnalysis = () => {
    const analytics = getAnalyticsData();
    const dateRangeText = dateRange.startDate || dateRange.endDate 
      ? ` (${dateRange.startDate || 'beginning'} to ${dateRange.endDate || 'now'})`
      : ' (All Time)';
    
    // Create a comprehensive CSV with analytics data
    const csvContent = [
      // Header
      'REJECTED FORMS ANALYSIS REPORT',
      `Generated: ${new Date().toLocaleDateString()}`,
      `Date Range: ${dateRangeText}`,
      '',
      
      // Summary Statistics
      'SUMMARY STATISTICS',
      'Metric,Count,Percentage',
      `Total Forms,${analytics.totalForms},100%`,
      `Rejected Forms,${analytics.rejectedForms},${analytics.rejectionRate}%`,
      `Approved Forms,${analytics.approvedForms},${analytics.approvalRate}%`,
      `Pending Forms,${analytics.pendingForms},${((analytics.pendingForms / analytics.totalForms) * 100).toFixed(1)}%`,
      '',
      
      // Rejection Reasons
      'REJECTION REASONS BREAKDOWN',
      'Reason,Count,Percentage',
      ...Object.entries(analytics.rejectionReasons).map(([reason, count]) => [
        reason,
        count,
        analytics.rejectedForms > 0 ? `${((count / analytics.rejectedForms) * 100).toFixed(1)}%` : '0%'
      ].join(',')),
      '',
      
      // Monthly Trends
      'MONTHLY TRENDS',
      'Month,Approved,Rejected,Pending,Total',
      ...analytics.monthlyData.map(([month, data]: [string, any]) => [
        month,
        data.approved,
        data.rejected,
        data.pending,
        data.approved + data.rejected + data.pending
      ].join(',')),
      '',
      
      // Detailed Form Data
      'DETAILED FORM DATA',
      'Form ID,Tenant Name,Property Address,Program Type,Status,Housing Specialist,Created Date,Amount,Rejection Reason',
      ...forms
        .filter(form => {
          if (!form.createdAt) return false;
          const formDate = new Date(form.createdAt);
          const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
          const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
          
          if (startDate && formDate < startDate) return false;
          if (endDate && formDate > endDate) return false;
          return true;
        })
        .map(form => [
          form.id,
          form.tenantName || 'N/A',
          `"${form.addressLine1 || ''} ${form.addressLine2 || ''} ${form.city || ''} ${form.state || ''} ${form.zipCode || ''}"`.trim(),
          form.programType || 'N/A',
          form.status === 0 ? 'Pending' : form.status === 1 ? 'Approved' : 'Rejected',
          form.housingSpecialistName || 'N/A',
          form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A',
          form.hapAmount ? `$${parseFloat(form.hapAmount).toFixed(2)}` : 'N/A',
          form.status === 2 ? 'See rejection reasons above' : 'N/A'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = `rejection-analysis-${dateRange.startDate || 'all'}-${dateRange.endDate || 'now'}-${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getUniqueSpecialists = () => {
    const specialists = forms
      .map(form => form.housingSpecialistName)
      .filter((name, index, self) => name && self.indexOf(name) === index);
    return specialists.sort();
  };

  // Analytics calculations for rejected forms analysis
  const getAnalyticsData = () => {
    // Filter forms by date range if specified
    let filteredForms = forms;
    if (dateRange.startDate || dateRange.endDate) {
      filteredForms = forms.filter(form => {
        if (!form.createdAt) return false;
        const formDate = new Date(form.createdAt);
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
        
        if (startDate && formDate < startDate) return false;
        if (endDate && formDate > endDate) return false;
        return true;
      });
    }
    
    const totalForms = filteredForms.length;
    const rejectedForms = filteredForms.filter(form => form.status === 2);
    const approvedForms = filteredForms.filter(form => form.status === 1);
    const pendingForms = filteredForms.filter(form => form.status === 0);
    
    const rejectionRate = totalForms > 0 ? (rejectedForms.length / totalForms) * 100 : 0;
    const approvalRate = totalForms > 0 ? (approvedForms.length / totalForms) * 100 : 0;
    
    // Rejection reasons analysis (mock data for now)
    const rejectionReasons = {
      'Incomplete Information': Math.floor(rejectedForms.length * 0.3),
      'Invalid Account Number': Math.floor(rejectedForms.length * 0.25),
      'Missing Documentation': Math.floor(rejectedForms.length * 0.2),
      'Incorrect Amount': Math.floor(rejectedForms.length * 0.15),
      'Other': Math.floor(rejectedForms.length * 0.1)
    };
    
    // Monthly trend data
    const monthlyData = filteredForms.reduce((acc, form) => {
      if (form.createdAt) {
        const month = new Date(form.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) {
          acc[month] = { approved: 0, rejected: 0, pending: 0 };
        }
        if (form.status === 0) acc[month].pending++;
        else if (form.status === 1) acc[month].approved++;
        else if (form.status === 2) acc[month].rejected++;
      }
      return acc;
    }, {} as any);
    
    return {
      totalForms,
      rejectedForms: rejectedForms.length,
      approvedForms: approvedForms.length,
      pendingForms: pendingForms.length,
      rejectionRate: Math.round(rejectionRate * 10) / 10,
      approvalRate: Math.round(approvalRate * 10) / 10,
      rejectionReasons,
      monthlyData: Object.entries(monthlyData).slice(-6) // Last 6 months
    };
  };

  // Simple Bar Chart Component
  const SimpleBarChart = ({ data, title, color = '#667eea' }: { data: { [key: string]: number }, title: string, color?: string }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(data).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {key}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      height: 20,
                      width: `${(value / maxValue) * 100}%`,
                      backgroundColor: color,
                      borderRadius: 1,
                      minWidth: value > 0 ? 4 : 0
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 30 }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Simple Pie Chart Component
  const SimplePieChart = ({ data, title }: { data: { [key: string]: number }, title: string }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    const colors = ['#f44336', '#4caf50', '#ff9800', '#2196f3', '#9c27b0'];
    
    let currentAngle = 0;
    const segments = Object.entries(data).map(([key, value], index) => {
      const percentage = (value / total) * 100;
      const angle = (value / total) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      return {
        key,
        value,
        percentage: Math.round(percentage * 10) / 10,
        startAngle,
        angle,
        color: colors[index % colors.length]
      };
    });
    
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative', width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {segments.map((segment, index) => {
                  const radius = 50;
                  const centerX = 60;
                  const centerY = 60;
                  
                  const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
                  const endAngleRad = (segment.startAngle + segment.angle - 90) * (Math.PI / 180);
                  
                  const x1 = centerX + radius * Math.cos(startAngleRad);
                  const y1 = centerY + radius * Math.sin(startAngleRad);
                  const x2 = centerX + radius * Math.cos(endAngleRad);
                  const y2 = centerY + radius * Math.sin(endAngleRad);
                  
                  const largeArcFlag = segment.angle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              {segments.map((segment, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      backgroundColor: segment.color,
                      borderRadius: '50%'
                    }}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {segment.key}: {segment.value} ({segment.percentage}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
          Report Viewer
        </Typography>
      </Toolbar>
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={onNavigateToDashboard}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#667eea' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={onNavigateToForm}>
            <ListItemIcon>
              <Description sx={{ color: '#667eea' }} />
            </ListItemIcon>
            <ListItemText primary="MCR Forms" />
          </ListItemButton>
        </ListItem>
        
        <ListItem disablePadding>
          <ListItemButton onClick={onNavigateToFormsList}>
            <ListItemIcon>
              <Assignment sx={{ color: '#667eea' }} />
            </ListItemIcon>
            <ListItemText primary="Task List" />
          </ListItemButton>
        </ListItem>
      </List>
      
      <Divider />
      
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Settings sx={{ color: '#667eea' }} />
            </ListItemIcon>
            <ListItemText primary="Report Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
            background: 'white',
            color: '#333',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <IconButton
              color="inherit"
              aria-label="go back"
              onClick={onNavigateBack}
              sx={{ 
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {getReportTitle()}
            </Typography>
            
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Notifications Dropdown */}
        {notificationsOpen && (
          <Box
            data-notification-dropdown
            sx={{
              position: 'fixed',
              top: 64,
              right: 16,
              width: 350,
              maxHeight: 400,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 1300,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#a8a8a8',
              },
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
            </Box>
            {notifications.map((notification) => (
              <Box
                key={notification.id}
                sx={{
                  p: 2,
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  {notification.time}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Main Content Area */}
        <Box sx={{ pt: 10, px: 3, pb: 3 }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 2 }}>
              {getReportTitle()}
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', maxWidth: '600px' }}>
              {getReportDescription()}
            </Typography>
          </Box>

          {/* Rejected Forms Analysis - Graphical View */}
          {reportType === 'rejected-forms' && (
            <>
              {/* Date Filter Section */}
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Date Range Filter
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 150 }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setDateRange({ startDate: '', endDate: '' })}
                  >
                    Clear Filters
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownloadRejectionAnalysis}
                    sx={{ ml: 'auto' }}
                  >
                    Download Analysis
                  </Button>
                </Box>
                
                {/* Quick Date Presets */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ color: '#666', alignSelf: 'center', mr: 1 }}>
                    Quick filters:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const today = new Date();
                      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                      setDateRange({
                        startDate: last30Days.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      });
                    }}
                  >
                    Last 30 Days
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const today = new Date();
                      const last90Days = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                      setDateRange({
                        startDate: last90Days.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      });
                    }}
                  >
                    Last 90 Days
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const today = new Date();
                      const thisYear = new Date(today.getFullYear(), 0, 1);
                      setDateRange({
                        startDate: thisYear.toISOString().split('T')[0],
                        endDate: today.toISOString().split('T')[0]
                      });
                    }}
                  >
                    This Year
                  </Button>
                </Box>
                {(dateRange.startDate || dateRange.endDate) && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Showing data from {dateRange.startDate || 'beginning'} to {dateRange.endDate || 'now'}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {(() => {
                const analytics = getAnalyticsData();
                return (
                  <>
                    {/* Filter Summary */}
                    {(dateRange.startDate || dateRange.endDate) && (
                      <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                          📊 Analytics based on {analytics.totalForms} forms in selected date range
                        </Typography>
                      </Box>
                    )}

                    {/* Key Metrics Cards */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                      <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <Cancel sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>
                            {analytics.rejectedForms}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Rejected Forms
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {analytics.rejectionRate}% of total
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <CheckCircle sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                            {analytics.approvedForms}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Approved Forms
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {analytics.approvalRate}% of total
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <Warning sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                            {analytics.pendingForms}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Pending Forms
                          </Typography>
                        </CardContent>
                      </Card>
                      
                      <Card sx={{ textAlign: 'center', p: 2 }}>
                        <CardContent>
                          <Assessment sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#667eea' }}>
                            {analytics.totalForms}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Forms
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>

                    {/* Charts Section */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
                      <SimplePieChart 
                        data={{
                          'Rejected': analytics.rejectedForms,
                          'Approved': analytics.approvedForms,
                          'Pending': analytics.pendingForms
                        }}
                        title="Form Status Distribution"
                      />
                      
                      <SimpleBarChart 
                        data={analytics.rejectionReasons}
                        title="Rejection Reasons"
                        color="#f44336"
                      />
                    </Box>

                    {/* Monthly Trends */}
                    <Card sx={{ mb: 4 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                          Monthly Trends (Last 6 Months)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                          {analytics.monthlyData.map(([month, data]: [string, any]) => (
                            <Box key={month} sx={{ minWidth: 120, textAlign: 'center' }}>
                              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                                {month}
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box sx={{ width: 8, height: 8, backgroundColor: '#f44336', borderRadius: '50%' }} />
                                  <Typography variant="caption">Rejected: {data.rejected}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box sx={{ width: 8, height: 8, backgroundColor: '#4caf50', borderRadius: '50%' }} />
                                  <Typography variant="caption">Approved: {data.approved}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Box sx={{ width: 8, height: 8, backgroundColor: '#ff9800', borderRadius: '50%' }} />
                                  <Typography variant="caption">Pending: {data.pending}</Typography>
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </>
          )}

          {/* Standard Table View for non-rejected-forms reports */}
          {reportType !== 'rejected-forms' && (
            <>
              {/* Filters Section */}
              <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                  <TextField
                    placeholder="Search forms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ minWidth: 250 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Housing Specialist</InputLabel>
                    <Select
                      value={specialistFilter}
                      onChange={(e) => setSpecialistFilter(e.target.value)}
                      label="Housing Specialist"
                    >
                      <MenuItem value="all">All Specialists</MenuItem>
                      {getUniqueSpecialists().map((specialist) => (
                        <MenuItem key={specialist} value={specialist}>
                          {specialist}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    startIcon={<Download />}
                    onClick={handleDownloadExcel}
                    sx={{ ml: 'auto' }}
                  >
                    Download Excel
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Showing {filteredForms.length} of {forms.length} forms
                  </Typography>
                  <Chip
                    icon={<FilterList />}
                    label={`${searchTerm ? 'Search' : ''} ${statusFilter !== 'all' ? 'Status' : ''} ${specialistFilter !== 'all' ? 'Specialist' : ''}`.trim() || 'All Forms'}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              </Paper>

              {/* Data Table */}
              <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Form ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Tenant Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Property Address</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Program Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Housing Specialist</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredForms
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((form) => (
                         <TableRow key={form.id} hover>
                           <TableCell>{form.id}</TableCell>
                           <TableCell>{form.tenantName || 'N/A'}</TableCell>
                           <TableCell>
                             {`${form.addressLine1 || ''} ${form.addressLine2 || ''} ${form.city || ''} ${form.state || ''} ${form.zipCode || ''}`.trim() || 'N/A'}
                           </TableCell>
                           <TableCell>{form.programType || 'N/A'}</TableCell>
                           <TableCell>{getStatusChip(form.status)}</TableCell>
                           <TableCell>{form.housingSpecialistName || 'N/A'}</TableCell>
                           <TableCell>
                             {form.createdAt ? new Date(form.createdAt).toLocaleDateString() : 'N/A'}
                           </TableCell>
                           <TableCell>
                             {form.hapAmount ? `$${parseFloat(form.hapAmount).toFixed(2)}` : 'N/A'}
                           </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={filteredForms.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>

              {/* Empty State */}
              {filteredForms.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Assessment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                    No forms found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    Try adjusting your search criteria or filters
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ReportViewer;
