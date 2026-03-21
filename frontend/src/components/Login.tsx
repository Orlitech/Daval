import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Paper,
  Avatar,
  Fade,
  Zoom,
  Slide,
  Collapse,
  LinearProgress,
  Chip,
  Stack,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Backdrop,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  MedicalServices as MedicalIcon,
  Login as LoginIcon,
  Fingerprint as FingerprintIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  VerifiedUser as VerifiedUserIcon,
  VpnKey as VpnKeyIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { auth } from '../api';
import type { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

// Feature highlights for the carousel
const features = [
  {
    icon: <DashboardIcon />,
    title: 'Real-time Dashboard',
    description: 'Monitor data quality metrics in real-time'
  },
  {
    icon: <AnalyticsIcon />,
    title: 'Advanced Analytics',
    description: 'Deep insights into data validation patterns'
  },
  {
    icon: <SpeedIcon />,
    title: 'High Performance',
    description: 'Fast and responsive data processing'
  },
  {
    icon: <TimelineIcon />,
    title: 'Trend Analysis',
    description: 'Track quality improvements over time'
  }
];

export default function Login({ onLogin }: LoginProps) {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem('savedUsername');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    if (savedRememberMe && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  // Auto-rotate feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCapsLock = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.getModifierState('CapsLock')) {
      setCapsLock(true);
    } else {
      setCapsLock(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await auth.login(username, password);
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('savedUsername', username);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('rememberMe');
      }
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        onLogin(user);
      }, 1000);
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      // Shake animation for error
      const formElement = document.querySelector('.login-form');
      if (formElement) {
        formElement.classList.add('shake');
        setTimeout(() => formElement.classList.remove('shake'), 500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearError = () => {
    setError('');
  };

  return (
    <>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showSuccess}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="success" sx={{ mb: 2 }} />
          <Typography variant="h6">Login successful!</Typography>
          <Typography variant="body2">Redirecting to dashboard...</Typography>
        </Box>
      </Backdrop>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated Background with Multiple Layers */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        >
          {/* Gradient Orbs */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '40%',
              height: '40%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
              borderRadius: '50%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              right: '5%',
              width: '45%',
              height: '45%',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.12)} 0%, transparent 70%)`,
              borderRadius: '50%',
              animation: 'float 10s ease-in-out infinite reverse',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '60%',
              height: '60%',
              background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 70%)`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 8s ease-in-out infinite',
            }}
          />
          
          {/* Animated Grid Lines */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.03)} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              animation: 'slide 20s linear infinite',
            }}
          />
          
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-30px) scale(1.05); }
            }
            @keyframes pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
              50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
            }
            @keyframes slide {
              0% { background-position: 0 0; }
              100% { background-position: 40px 40px; }
            }
            .shake {
              animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
            }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
              20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 5px ${alpha(theme.palette.primary.main, 0.3)}; }
              50% { box-shadow: 0 0 20px ${alpha(theme.palette.primary.main, 0.6)}; }
            }
            .glow {
              animation: glow 2s ease-in-out infinite;
            }
          `}</style>
        </Box>

        {/* Login Card */}
        <Zoom in timeout={500}>
          <Card
            className="login-form"
            sx={{
              width: '100%',
              maxWidth: 480,
              mx: 2,
              position: 'relative',
              zIndex: 1,
              borderRadius: 4,
              boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              bgcolor: alpha(theme.palette.background.paper, 0.95),
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.2)}`,
              }
            }}
          >
            {/* Header Gradient Animation */}
            <Box
              sx={{
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                backgroundSize: '200% 100%',
                animation: 'gradientShift 3s ease infinite',
              }}
            />
            <style>{`
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Logo and Title */}
              <Fade in timeout={800}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 88,
                        height: 88,
                        mx: 'auto',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                        animation: 'glow 2s ease-in-out infinite',
                      }}
                    >
                      <MedicalIcon sx={{ fontSize: 48 }} />
                    </Avatar>
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -5,
                        right: -5,
                        bgcolor: theme.palette.success.main,
                        borderRadius: '50%',
                        p: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <VerifiedUserIcon sx={{ fontSize: 16, color: 'white' }} />
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      fontSize: { xs: '1.75rem', sm: '2rem' }
                    }}
                  >
                    DAVAL
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Data Validation & Analytics System
                  </Typography>

                  {/* Security Badge */}
                  <Chip
                    icon={<SecurityIcon />}
                    label="Secure Login"
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Fade>

              {/* Features Carousel */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    >
                      {features[activeFeature].icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {features[activeFeature].title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {features[activeFeature].description}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Carousel Indicators */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
                    {features.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: activeFeature === index 
                            ? theme.palette.primary.main 
                            : alpha(theme.palette.text.secondary, 0.3),
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.2)',
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Error Alert */}
              <Collapse in={!!error}>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    animation: 'shake 0.5s',
                  }}
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={handleClearError}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              </Collapse>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  margin="normal"
                  variant="outlined"
                  required
                  autoComplete="username"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleCapsLock}
                  margin="normal"
                  variant="outlined"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={loading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    capsLock && (
                      <Typography variant="caption" color="warning.main">
                        Caps Lock is on
                      </Typography>
                    )
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                        disabled={loading}
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        Remember me
                      </Typography>
                    }
                  />
                  <Tooltip title="Contact your administrator to reset password" arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.primary.main,
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </Tooltip>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !username || !password}
                  endIcon={!loading && <ArrowForwardIcon />}
                  sx={{
                    mt: 2,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.common.white, 0.3)}, transparent)`,
                      transition: 'left 0.5s ease',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Signing in...
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Loading Progress Bar */}
                {loading && (
                  <LinearProgress sx={{ mt: 1, borderRadius: 1 }} />
                )}
              </form>

              <Divider sx={{ my: 3 }}>
                <Chip
                  label="Secure Access"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    color: 'text.secondary'
                  }}
                />
              </Divider>

              {/* Demo Credentials - Enhanced
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  borderColor: alpha(theme.palette.info.main, 0.2),
                }}
              >
                <Typography variant="caption" fontWeight="bold" color="info.main" gutterBottom display="block">
                  Demo Credentials
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Username:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                      demo_user
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Password:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
                      demo_pass
                    </Typography>
                  </Grid>
                </Grid>
                <Tooltip title="Click to auto-fill demo credentials" arrow>
                  <Button
                    size="small"
                    variant="text"
                    fullWidth
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setUsername('demo_user');
                      setPassword('demo_pass');
                    }}
                  >
                    <FingerprintIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Auto-fill Demo
                  </Button>
                </Tooltip>
              </Paper> */}

              {/* Additional Info */}
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  © {new Date().getFullYear()} DAVAL System. All rights reserved | developed by olamide.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                    Privacy Policy
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                    Terms of Service
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                    Support
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Zoom>
      </Box>
    </>
  );
}