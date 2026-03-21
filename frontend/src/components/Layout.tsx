import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type{ User } from '../types';

interface LayoutProps {
  user: User;
  activeCycle: any;
  currentTab: number;
  onTabChange: (tab: number) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ 
  user, 
  activeCycle, 
  currentTab, 
  onTabChange, 
  onLogout,
  children 
}: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, tab: 0, roles: ['staff', 'supervisor', 'admin'] },
    { text: 'Validation', icon: <AssignmentIcon />, tab: 1, roles: ['staff', 'supervisor', 'admin'] },
    { text: 'Supervisor', icon: <SupervisorAccountIcon />, tab: 2, roles: ['supervisor', 'admin'] },
    { text: 'Reports', icon: <AssessmentIcon />, tab: 3, roles: ['supervisor', 'admin'] },
    { text: 'Admin', icon: <AdminPanelSettingsIcon />, tab: 4, roles: ['admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleColor = () => {
    switch(user.role) {
      case 'admin': return 'error';
      case 'supervisor': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            RADET Client Data Validation
          </Typography>
          
          {activeCycle?.has_active_cycle && (
            <Chip
              label={`Active: ${activeCycle.name}`}
              color="secondary"
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'white', mr: 2 }}
            />
          )}
          
          <Chip
            label={user.role}
            color={getRoleColor()}
            size="small"
            sx={{ mr: 2 }}
          />
          
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user.full_name.charAt(0)}
            </Avatar>
          </IconButton>
          
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="body2">{user.full_name}</Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="body2" color="textSecondary">{user.facility}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={onLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box', top: 64 }
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {visibleMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                selected={currentTab === item.tab}
                onClick={() => onTabChange(item.tab)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: drawerOpen ? 0 : -30,
          transition: 'margin 0.3s',
          minHeight: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
}