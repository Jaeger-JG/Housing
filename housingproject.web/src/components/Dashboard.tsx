import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  Button,
  Badge,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description,
  Assignment,
  Business,
  BarChart,
  Notifications,
  Settings,
  Logout,
  CheckCircle,
  Pending,
  Cancel,
  Visibility,
  Edit,
  ArrowBack
} from '@mui/icons-material';

interface DashboardProps {
  onNavigateToForm: () => void;
  onNavigateToFormsList: () => void;
  onNavigateToEditForm: (formData: any) => void;
  onNavigateToFormDetails: (formId: number) => void;
  onNavigateBack?: () => void;
  onLogout?: () => void;
  username?: string;
}

const drawerWidth = 280;

const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToForm,
  onNavigateToFormsList,
  onNavigateToEditForm,
  onNavigateToFormDetails,
  onNavigateBack,
  onLogout,
  username
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleFormClick = (form: any) => {
    if (form.status.toLowerCase() === 'rejected') {
      // For rejected forms, navigate to edit mode with the complete original form data
      onNavigateToEditForm(form.originalFormData);
    } else {
      // For other forms, navigate to form details (existing behavior)
      onNavigateToFormDetails(form.id);
    }
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleNotificationAction = (notification: any) => {
    if (notification.id === 'rejected-forms') {
      setStatusFilter('Rejected');
    }
    setNotificationsOpen(false);
  };

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'total':
        setStatusFilter('All');
        break;
      case 'pending':
        setStatusFilter('Pending');
        break;
      case 'approved':
        setStatusFilter('Approved');
        break;
      case 'rejected':
        setStatusFilter('Rejected');
        break;
      case 'thisMonth':
        // For this month, we could show all forms or navigate to forms list
        onNavigateToFormsList();
        break;
      default:
        break;
    }
  };

  // Format username to display name
  const formatUsernameToName = (username: string): string => {
    if (!username) return 'User';
    const parts = username.split('.');
    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  };

  const displayName = username ? formatUsernameToName(username) : 'User';

  // State for dashboard data
  const [stats, setStats] = useState({
    totalForms: 0,
    pendingForms: 0,
    approvedForms: 0,
    rejectedForms: 0,
    thisMonth: 0,
    lastMonth: 0
  });

  const [recentForms, setRecentForms] = useState<any[]>([]);
  const [allUserForms, setAllUserForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch user's forms data
  useEffect(() => {
    const fetchUserForms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://housing-forms.cityofvallejo.net/api/MCR', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const allForms = await response.json();
        
        // Filter forms created by the current user
        const userForms = allForms.filter((form: any) => 
          form.housingSpecialistName && 
          form.housingSpecialistName.toLowerCase() === displayName.toLowerCase()
        );

        // Transform all forms for display, but keep the original form data for editing
        const transformedForms = userForms.map((form: any) => ({
          id: form.id,
          tenantName: form.tenantName,
          address: `${form.addressLine1}, ${form.city}, ${form.state}`,
          status: typeof form.status === 'number' ? 
            ['Pending', 'Approved', 'Rejected', 'InReview'][form.status] || 'Pending' :
            form.status || 'Pending',
          date: new Date(form.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          // Keep the original form data for editing
          originalFormData: form
        }));

        // Sort by creation date (most recent first)
        const sortedForms = transformedForms
          .sort((a: any, b: any) => new Date(b.createdAt || a.date).getTime() - new Date(a.createdAt || a.date).getTime());

        setAllUserForms(sortedForms);

        // Calculate stats for user's forms
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthForms = userForms.filter((form: any) => {
          const formDate = new Date(form.createdAt);
          return formDate.getMonth() === currentMonth && formDate.getFullYear() === currentYear;
        });

        const lastMonthForms = userForms.filter((form: any) => {
          const formDate = new Date(form.createdAt);
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return formDate.getMonth() === lastMonth && formDate.getFullYear() === lastMonthYear;
        });

        setStats({
          totalForms: userForms.length,
          pendingForms: userForms.filter((f: any) => {
            const status = typeof f.status === 'number' ? 
              ['Pending', 'Approved', 'Rejected', 'InReview'][f.status] || 'Pending' :
              f.status || 'Pending';
            return status.toLowerCase() === 'pending';
          }).length,
          approvedForms: userForms.filter((f: any) => {
            const status = typeof f.status === 'number' ? 
              ['Pending', 'Approved', 'Rejected', 'InReview'][f.status] || 'Pending' :
              f.status || 'Pending';
            return status.toLowerCase() === 'approved';
          }).length,
          rejectedForms: userForms.filter((f: any) => {
            const status = typeof f.status === 'number' ? 
              ['Pending', 'Approved', 'Rejected', 'InReview'][f.status] || 'Pending' :
              f.status || 'Pending';
            return status.toLowerCase() === 'rejected';
          }).length,
          thisMonth: thisMonthForms.length,
          lastMonth: lastMonthForms.length
        });

      } catch (err) {
        console.error('Error fetching user forms:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserForms();
    }
  }, [username, displayName]);

  // Filter forms based on status filter
  useEffect(() => {
    if (statusFilter === 'All') {
      setRecentForms(allUserForms);
    } else {
      const filteredForms = allUserForms.filter(form => 
        form.status.toLowerCase() === statusFilter.toLowerCase()
      );
      setRecentForms(filteredForms);
    }
  }, [allUserForms, statusFilter]);

  // Generate notifications based on user's forms
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = [];
      
      // Check for rejected forms
      const rejectedForms = allUserForms.filter(form => form.status.toLowerCase() === 'rejected');
      if (rejectedForms.length > 0) {
        newNotifications.push({
          id: 'rejected-forms',
          type: 'error',
          title: 'Forms Need Attention',
          message: `You have ${rejectedForms.length} rejected form${rejectedForms.length > 1 ? 's' : ''} that need to be updated and resubmitted.`,
          action: 'Click to view rejected forms',
          timestamp: new Date()
        });
      }
      
      // Check for pending forms older than 7 days
      const oldPendingForms = allUserForms.filter(form => {
        if (form.status.toLowerCase() !== 'pending') return false;
        const formDate = new Date(form.createdAt);
        const daysDiff = (new Date().getTime() - formDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff > 7;
      });
      
      if (oldPendingForms.length > 0) {
        newNotifications.push({
          id: 'old-pending-forms',
          type: 'warning',
          title: 'Pending Forms Alert',
          message: `You have ${oldPendingForms.length} form${oldPendingForms.length > 1 ? 's' : ''} that have been pending for over 7 days.`,
          action: 'Consider following up on these forms',
          timestamp: new Date()
        });
      }
      
      // Check for forms submitted this week
      const thisWeekForms = allUserForms.filter(form => {
        const formDate = new Date(form.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return formDate >= weekAgo;
      });
      
      if (thisWeekForms.length > 0) {
        newNotifications.push({
          id: 'recent-activity',
          type: 'info',
          title: 'Recent Activity',
          message: `You've submitted ${thisWeekForms.length} form${thisWeekForms.length > 1 ? 's' : ''} this week.`,
          action: 'Great job staying on top of your workload!',
          timestamp: new Date()
        });
      }
      
      setNotifications(newNotifications);
    };
    
    if (allUserForms.length > 0) {
      generateNotifications();
    }
  }, [allUserForms]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsOpen) {
        const target = event.target as Element;
        if (!target.closest('[data-notification-dropdown]')) {
          setNotificationsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'in review':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Pending />;
      case 'in review':
        return <Visibility />;
      case 'rejected':
        return <Cancel />;
      default:
        return <Pending />;
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, active: true },
    { text: 'MCR Forms', icon: <Description />, onClick: onNavigateToForm },
    { text: 'Task List', icon: <Assignment />, onClick: onNavigateToFormsList },
    { text: 'Reports', icon: <BarChart /> },
    { text: 'Housing Applications', icon: <Business /> },
    { text: 'Settings', icon: <Settings /> }
  ];

  const drawer = (
    <Box>
      {/* User Profile Section */}
      <Box sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            {displayName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {displayName}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Housing Specialist
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 1 }}>
        {menuItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={item.onClick}
              sx={{
                borderRadius: 2,
                backgroundColor: item.active ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                color: item.active ? '#667eea' : 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ color: item.active ? '#667eea' : 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Logout Button */}
      <List sx={{ px: 2, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={onLogout} sx={{ borderRadius: 2, color: '#d32f2f' }}>
            <ListItemIcon sx={{ color: '#d32f2f', minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
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
            Housing Management Dashboard
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
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            zIndex: 1300,
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
              Notifications
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {notifications.length} new notification{notifications.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
          
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="textSecondary">
                  No notifications at this time
                </Typography>
              </Box>
            ) : (
              notifications.map((notification, index) => (
                <Box
                  key={notification.id}
                  onClick={() => handleNotificationAction(notification)}
                  sx={{
                    p: 2,
                    borderBottom: index < notifications.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: 
                          notification.type === 'error' ? '#f44336' :
                          notification.type === 'warning' ? '#ff9800' :
                          '#2196f3',
                        mt: 1,
                        flexShrink: 0
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                        {notification.action}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      )}

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#333', mb: 1 }}>
            Welcome back, {displayName}!
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Here's what's happening with your housing management tasks today.
          </Typography>
        </Box>

        {/* Error State */}
        {error && (
          <Box sx={{ mb: 4, p: 2, backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 1 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          <Card 
            onClick={() => handleCardClick('total')}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.25)'
              }
            }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    Total Forms
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalForms}
                  </Typography>
                </Box>
                <Description sx={{ fontSize: 40, opacity: 0.9 }} />
              </Box>
            </CardContent>
          </Card>

          <Card 
            onClick={() => handleCardClick('pending')}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              color: '#495057',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                borderColor: '#ffc107'
              }
            }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Pending
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pendingForms}
                  </Typography>
                </Box>
                <Pending sx={{ fontSize: 40, opacity: 0.7, color: '#ffc107' }} />
              </Box>
            </CardContent>
          </Card>

          <Card 
            onClick={() => handleCardClick('approved')}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              color: '#495057',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                borderColor: '#28a745'
              }
            }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Approved
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.approvedForms}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.7, color: '#28a745' }} />
              </Box>
            </CardContent>
          </Card>

          <Card 
            onClick={() => handleCardClick('rejected')}
            sx={{ 
              height: '100%', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              color: '#495057',
              border: '1px solid #dee2e6',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                borderColor: '#dc3545'
              }
            }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="inherit" sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
                    Rejected
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.rejectedForms}
                  </Typography>
                </Box>
                <Cancel sx={{ fontSize: 40, opacity: 0.7, color: '#dc3545' }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Forms and Quick Actions */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3 
        }}>
          {/* Recent Forms */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Forms
                </Typography>
                <TextField
                  select
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{
                    minWidth: 120,
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
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="InReview">In Review</MenuItem>
                </TextField>
              </Box>
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Loading your forms...
                  </Typography>
                </Box>
              ) : recentForms.length > 0 ? (
                <Box sx={{ 
                  maxHeight: 400, 
                  overflowY: 'auto',
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
                    '&:hover': {
                      background: '#a8a8a8',
                    },
                  },
                }}>
                  <List>
                    {recentForms.map((form, index) => (
                    <React.Fragment key={form.id}>
                      <ListItem
                        onClick={() => handleFormClick(form)}
                        sx={{
                          px: 0,
                          py: 1.5,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: form.status.toLowerCase() === 'rejected' 
                              ? 'rgba(244, 67, 54, 0.05)' 
                              : 'rgba(102, 126, 234, 0.05)',
                            borderRadius: 1
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {getStatusIcon(form.status)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {form.tenantName}
                              </Typography>
                              <Chip
                                label={form.status}
                                size="small"
                                color={getStatusColor(form.status) as any}
                                sx={{ fontSize: '0.75rem' }}
                              />
                              {form.status.toLowerCase() === 'rejected' && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                                  <Edit sx={{ fontSize: 14, color: '#f44336' }} />
                                  <Typography variant="caption" sx={{ color: '#f44336', fontSize: '0.7rem' }}>
                                    Click to edit
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {form.address}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Form #{form.id} • {form.date}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentForms.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  </List>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 48, color: '#dee2e6', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    {statusFilter === 'All' ? 'No forms created yet' : `No ${statusFilter.toLowerCase()} forms found`}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {statusFilter === 'All' 
                      ? 'Your created forms will appear here' 
                      : `Try selecting a different status or create new forms`
                    }
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Description />}
                  onClick={onNavigateToForm}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  Create New MCR Form
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={onNavigateToFormsList}
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    }
                  }}
                >
                  Review Forms
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BarChart />}
                  sx={{
                    borderColor: '#667eea',
                    color: '#667eea',
                    py: 1.5,
                    '&:hover': {
                      borderColor: '#5a6fd8',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    }
                  }}
                >
                  View Reports
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
