import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  alpha,
  useTheme,
  LinearProgress,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import type { HospitalNumberValidationSummary, ValidationResult } from '../types';

interface ValidationScoreCardProps {
  summary: HospitalNumberValidationSummary;
  onViewDetails?: (hospitalNumber: string) => void;
}

const getScoreColor = (score: number): string => {
  if (score === 100) return '#10b981';
  if (score >= 80) return '#84cc16';
  if (score >= 60) return '#eab308';
  if (score >= 30) return '#f97316';
  return '#ef4444';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'MATCH':
      return <CheckCircleIcon sx={{ color: '#10b981' }} />;
    case 'MISMATCH':
      return <ErrorIcon sx={{ color: '#ef4444' }} />;
    case 'LOGICAL_ERROR':
      return <WarningIcon sx={{ color: '#ef4444' }} />;
    default:
      return <InfoIcon sx={{ color: '#f59e0b' }} />;
  }
};

export default function ValidationScoreCard({ summary, onViewDetails }: ValidationScoreCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const scoreColor = getScoreColor(summary.score_percentage);
  
  return (
    <>
      <Card sx={{ 
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(scoreColor, 0.3),
        bgcolor: alpha(scoreColor, 0.02),
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateX(4px)',
          boxShadow: `0 4px 12px ${alpha(scoreColor, 0.2)}`
        }
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ position: 'relative', mr: 2 }}>
              <Box sx={{ width: 60, height: 60, position: 'relative' }}>
                <Box sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%',
                  border: `3px solid ${scoreColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(scoreColor, 0.1)
                }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: scoreColor }}>
                    {summary.score_percentage}%
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight="bold">
                {summary.hospital_number}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  label={summary.classification}
                  size="small"
                  sx={{
                    bgcolor: alpha(scoreColor, 0.1),
                    color: scoreColor,
                    fontWeight: 600
                  }}
                />
                <Chip
                  label={`${summary.passed_checks}/${summary.total_checks} passed`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
            
            <Box>
              <Tooltip title="View Details">
                <IconButton onClick={() => onViewDetails?.(summary.hospital_number)}>
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setExpanded(!expanded)}>
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={summary.score_percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: alpha(scoreColor, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: scoreColor,
                borderRadius: 4
              }
            }}
          />

          <Collapse in={expanded}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Failed Checks ({summary.failed_checks})
              </Typography>
              <List dense>
                {summary.failed_fields.map((field, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemText
                      primary={field.field_name.replace(/_/g, ' ')}
                      secondary={
                        <Box component="span">
                          <Typography variant="caption" display="block">
                            RADET: {field.radet_value || '—'} | Care Card: {field.care_card_value || '—'}
                          </Typography>
                          {field.logical_error && (
                            <Typography variant="caption" color="error">
                              {field.logical_error}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Chip
                      size="small"
                      icon={getStatusIcon(field.status)}
                      label={field.status}
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Validation Details - {summary.hospital_number}</Typography>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Detailed view would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}