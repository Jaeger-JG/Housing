import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description,
  Assignment,
  Notifications,
  Settings,
  ArrowBack,
  GetApp,
  Visibility,
  TrendingUp,
  Assessment,
  Refresh,
  CalendarToday
} from '@mui/icons-material';

interface ReportsProps {
  onNavigateBack?: () => void;
  onNavigateToForm: () => void;
  onNavigateToFormsList: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToReportViewer: (reportType: string) => void;
  onLogout?: () => void;
  username?: string;
}

const drawerWidth = 280;

const Reports: React.FC<ReportsProps> = ({
  onNavigateBack,
  onNavigateToForm,
  onNavigateToFormsList,
  onNavigateToDashboard,
  onNavigateToReportViewer,
  onLogout,
  username
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('30');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedReportForSchedule, setSelectedReportForSchedule] = useState<string | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState({
    frequency: 'daily',
    time: '09:00',
    email: '',
    enabled: false
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
      { id: 1, type: 'info', message: 'New report data available', time: '2 hours ago' },
      { id: 2, type: 'warning', message: 'Monthly report due in 3 days', time: '1 day ago' },
      { id: 3, type: 'success', message: 'Report generated successfully', time: '2 days ago' }
    ];
    setNotifications(sampleNotifications);
  }, []);

  const reportCategories = [
    {
      id: 'forms',
      name: 'MCR Reports',
      icon: <Description sx={{ fontSize: 24, color: '#667eea' }} />,
      color: '#667eea',
      reports: [
        {
          id: 'mcr-summary',
          title: 'MCR Form Summary',
          description: 'Overview of all MCR forms with status breakdown',
          type: 'summary',
          icon: <Assessment sx={{ fontSize: 20 }} />,
          lastRun: '2 hours ago',
          frequency: 'Daily'
        },
        {
          id: 'rejected-forms',
          title: 'Rejected Forms Analysis',
          description: 'Analysis of rejected forms and common issues',
          type: 'analysis',
          icon: <TrendingUp sx={{ fontSize: 20 }} />,
          lastRun: '3 days ago',
          frequency: 'Monthly'
        },
        {
          id: 'form-approvals',
          title: 'Form Approval Report',
          description: 'Detailed approval workflow and processing times',
          type: 'detailed',
          icon: <Assignment sx={{ fontSize: 20 }} />,
          lastRun: '1 day ago',
          frequency: 'Weekly'
        }
      ]
    }
  ];

  const filteredReports = reportCategories
    .filter(category => selectedCategory === 'all' || category.id === selectedCategory)
    .flatMap(category => 
      category.reports.map(report => ({
        ...report,
        category: category.name,
        categoryColor: category.color
      }))
    )
    .filter(report => 
      selectedStatus === 'all' || 
      (selectedStatus === 'recent' && report.lastRun.includes('hour')) ||
      (selectedStatus === 'scheduled' && report.frequency !== 'On Demand')
    );

  const handleRunReport = (reportId: string) => {
    console.log(`Running report: ${reportId}`);
    // Navigate to the report viewer with the specific report type
    onNavigateToReportViewer(reportId);
  };

  const handleDownloadReport = async (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    
    try {
      // Fetch all forms data
      const response = await fetch('https://housing-forms.cityofvallejo.net/api/MCR');
      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }
      
      const forms = await response.json();
      
      // Create CSV data with all forms (no filters)
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

      const csvData = forms.map((form: any) => [
        form.id,
        form.tenantName || '',
        `${form.addressLine1 || ''} ${form.addressLine2 || ''} ${form.city || ''} ${form.state || ''} ${form.zipCode || ''}`.trim(),
        form.programType || '',
        form.status === 0 ? 'Pending' : form.status === 1 ? 'Approved' : form.status === 2 ? 'Rejected' : 'Unknown',
        form.housingSpecialistName || '',
        form.createdAt ? new Date(form.createdAt).toLocaleDateString() : '',
        form.hapAmount ? `$${parseFloat(form.hapAmount).toFixed(2)}` : ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map((field: any) => `"${field}"`).join(','))
        .join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `mcr-form-summary-complete-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const handleScheduleReport = (reportId: string) => {
    console.log(`Scheduling report: ${reportId}`);
    setSelectedReportForSchedule(reportId);
    setScheduleDialogOpen(true);
  };

  const handleScheduleDialogClose = () => {
    setScheduleDialogOpen(false);
    setSelectedReportForSchedule(null);
    setScheduleSettings({
      frequency: 'daily',
      time: '09:00',
      email: '',
      enabled: false
    });
  };

  const handleScheduleSubmit = () => {
    console.log('Scheduling report:', selectedReportForSchedule, 'with settings:', scheduleSettings);
    // Here you would implement the actual scheduling logic
    // This could involve setting up a cron job, database entry, or API call
    
    // For now, just show a success message
    alert(`Report scheduled successfully! ${scheduleSettings.enabled ? 
      `Will run ${scheduleSettings.frequency} at ${scheduleSettings.time}` : 
      'Scheduling disabled'}`);
    
    handleScheduleDialogClose();
  };

  const getReportTitle = (reportId: string) => {
    const titles = {
      'mcr-summary': 'MCR Form Summary',
      'rejected-forms': 'Rejected Forms Analysis',
      'form-approvals': 'Form Approval Report'
    };
    return titles[reportId as keyof typeof titles] || 'Report';
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea' }}>
          Reports Portal
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
        
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <CalendarToday sx={{ color: '#667eea' }} />
            </ListItemIcon>
            <ListItemText primary="Scheduled Reports" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

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
            
            {onNavigateBack && (
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
            )}
            
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Reports & Analytics
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
              Reports & Analytics
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', maxWidth: '600px' }}>
              Generate comprehensive reports and analytics for housing management, form processing, and administrative insights.
            </Typography>
          </Box>

          {/* Filters Section */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {reportCategories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Reports</MenuItem>
                  <MenuItem value="recent">Recently Run</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                  <MenuItem value="365">Last year</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                sx={{ ml: 'auto' }}
              >
                Refresh
              </Button>
            </Box>
          </Paper>

          {/* Reports Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3 
          }}>
            {filteredReports.map((report) => (
              <Box key={report.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: `${report.categoryColor}15`,
                          mr: 2,
                        }}
                      >
                        {report.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                          {report.title}
                        </Typography>
                        <Chip
                          label={report.category}
                          size="small"
                          sx={{
                            backgroundColor: `${report.categoryColor}20`,
                            color: report.categoryColor,
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ color: '#666', mb: 2, lineHeight: 1.6 }}>
                      {report.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        Last run: {report.lastRun}
                      </Typography>
                      <Chip
                        label={report.frequency}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Visibility />}
                      onClick={() => handleRunReport(report.id)}
                      sx={{
                        backgroundColor: report.categoryColor,
                        '&:hover': {
                          backgroundColor: report.categoryColor,
                          opacity: 0.9,
                        },
                      }}
                    >
                      Run Report
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GetApp />}
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<CalendarToday />}
                      onClick={() => handleScheduleReport(report.id)}
                    >
                      Schedule
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>

          {/* Empty State */}
          {filteredReports.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Assessment sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                No reports found
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                Try adjusting your filters to see more reports
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Schedule Report Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={handleScheduleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Schedule Report: {selectedReportForSchedule ? getReportTitle(selectedReportForSchedule) : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Enable/Disable Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Switch
                checked={scheduleSettings.enabled}
                onChange={(e) => setScheduleSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                color="primary"
              />
              <Typography variant="body1" sx={{ ml: 1 }}>
                Enable automatic report generation
              </Typography>
            </Box>

            {scheduleSettings.enabled && (
              <>
                {/* Frequency Selection */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={scheduleSettings.frequency}
                    onChange={(e) => setScheduleSettings(prev => ({ ...prev, frequency: e.target.value }))}
                    label="Frequency"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>

                {/* Time Selection */}
                <TextField
                  fullWidth
                  label="Time"
                  type="time"
                  value={scheduleSettings.time}
                  onChange={(e) => setScheduleSettings(prev => ({ ...prev, time: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                />

                {/* Email Notification */}
                <TextField
                  fullWidth
                  label="Email for notifications (optional)"
                  type="email"
                  value={scheduleSettings.email}
                  onChange={(e) => setScheduleSettings(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  sx={{ mb: 2 }}
                />

                {/* Schedule Preview */}
                <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    Schedule Preview:
                  </Typography>
                  <Typography variant="body1">
                    Report will be generated {scheduleSettings.frequency} at {scheduleSettings.time}
                    {scheduleSettings.email && ` and sent to ${scheduleSettings.email}`}
                  </Typography>
                </Paper>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScheduleDialogClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleSubmit} 
            variant="contained"
            disabled={scheduleSettings.enabled && !scheduleSettings.time}
          >
            {scheduleSettings.enabled ? 'Schedule Report' : 'Save Settings'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
