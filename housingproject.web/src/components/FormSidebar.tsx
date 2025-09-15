import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Chip
} from '@mui/material';
import { 
  Assignment
} from '@mui/icons-material';

interface FormOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isActive?: boolean;
}

interface FormSidebarProps {
  selectedForm: string;
  onFormSelect: (formId: string) => void;
}

const FormSidebar: React.FC<FormSidebarProps> = ({ selectedForm, onFormSelect }) => {
  const formOptions: FormOption[] = [
    {
      id: 'mcr',
      title: 'Manual Check Request',
      description: 'Submit MCR forms for housing assistance',
      icon: <Assignment />,
      category: 'Housing',
      isActive: true
    }
  ];

  const groupedForms = formOptions.reduce((acc, form) => {
    if (!acc[form.category]) {
      acc[form.category] = [];
    }
    acc[form.category].push(form);
    return acc;
  }, {} as Record<string, FormOption[]>);

      return (
      <Paper 
        elevation={2}
        sx={{ 
          width: 280,
          height: '100vh',
          overflow: 'hidden',
          borderRadius: 0,
          background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
          border: 'none',
          borderRight: '1px solid rgba(102, 126, 234, 0.1)'
        }}
      >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#667eea', mb: 1 }}>
          Forms & Services
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Select a form or service to get started
        </Typography>
      </Box>

      <Box sx={{ px: 1 }}>
        {Object.entries(groupedForms).map(([category, forms]) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 600, 
                color: '#667eea',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {category}
              </Typography>
            </Box>
            <List dense sx={{ py: 0 }}>
              {forms.map((form) => (
                <ListItem
                  key={form.id}
                  onClick={() => onFormSelect(form.id)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.5,
                    cursor: 'pointer',
                    backgroundColor: selectedForm === form.id ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedForm === form.id 
                        ? 'rgba(102, 126, 234, 0.2)' 
                        : 'rgba(102, 126, 234, 0.1)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: selectedForm === form.id ? '#667eea' : 'text.secondary',
                    minWidth: 40
                  }}>
                    {form.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: selectedForm === form.id ? 600 : 500,
                          color: selectedForm === form.id ? '#667eea' : 'text.primary'
                        }}>
                          {form.title}
                        </Typography>
                        {form.isActive && (
                          <Chip 
                            label="Active" 
                            size="small" 
                            color="success" 
                            sx={{ height: 16, fontSize: '0.6rem' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="textSecondary">
                        {form.description}
                      </Typography>
                    }
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        lineHeight: 1.2
                      },
                      '& .MuiListItemText-secondary': {
                        lineHeight: 1.2,
                        mt: 0.5
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ mx: 2, my: 1 }} />
          </Box>
        ))}
      </Box>


      <Box sx={{ p: 2, mt: 'auto' }}>
        <Typography variant="caption" color="textSecondary" sx={{ textAlign: 'center', display: 'block' }}>
          Vallejo Housing
        </Typography>
      </Box>
    </Paper>
  );
};

export default FormSidebar; 