import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  Tooltip,
  Grid
} from '@mui/material';
import {
  EmojiEvents as EmojiEventsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import type { DataQualityIndexResponse } from '../types';

interface FacilityDQICardProps {
  facility: DataQualityIndexResponse;
  rank: number;
}

export default function FacilityDQICard({ facility, rank }: FacilityDQICardProps) {
  const theme = useTheme();

  const getRankIcon = () => {
    if (rank === 1) return <EmojiEventsIcon sx={{ color: '#ffd700' }} />;
    if (rank === 2) return <EmojiEventsIcon sx={{ color: '#c0c0c0' }} />;
    if (rank === 3) return <EmojiEventsIcon sx={{ color: '#cd7f32' }} />;
    return null;
  };

  return (
    <Card sx={{ 
      mb: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: alpha(facility.color_code, 0.3),
      bgcolor: alpha(facility.color_code, 0.02)
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2 }}>
            {getRankIcon() || (
              <Typography variant="h6" fontWeight="bold" color="text.secondary">
                #{rank}
              </Typography>
            )}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {facility.facility_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {facility.total_patients_validated} patients validated
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: facility.color_code }}>
              {facility.dqi_score}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              DQI Score
            </Typography>
          </Box>
        </Box>

        <LinearProgress
          variant="determinate"
          value={facility.dqi_score}
          sx={{
            height: 8,
            borderRadius: 4,
            mb: 2,
            bgcolor: alpha(facility.color_code, 0.1),
            '& .MuiLinearProgress-bar': {
              bgcolor: facility.color_code,
              borderRadius: 4
            }
          }}
        />

        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Tooltip title="Perfect Match (100%)">
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  size="small"
                  label={facility.classification_breakdown["Perfect Match"]}
                  sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', width: '100%' }}
                />
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Low Discrepancy (80-99%)">
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  size="small"
                  label={facility.classification_breakdown["Low Discrepancy"]}
                  sx={{ bgcolor: alpha('#84cc16', 0.1), color: '#84cc16', width: '100%' }}
                />
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={4}>
            <Tooltip title="Moderate Discrepancy (60-79%)">
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  size="small"
                  label={facility.classification_breakdown["Moderate Discrepancy"]}
                  sx={{ bgcolor: alpha('#eab308', 0.1), color: '#eab308', width: '100%' }}
                />
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="High Discrepancy (30-59%)">
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  size="small"
                  label={facility.classification_breakdown["High Discrepancy"]}
                  sx={{ bgcolor: alpha('#f97316', 0.1), color: '#f97316', width: '100%' }}
                />
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Critical Issue (<30%)">
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  size="small"
                  label={facility.classification_breakdown["Critical Issue"]}
                  sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', width: '100%' }}
                />
              </Box>
            </Tooltip>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Expected Checks: {facility.total_expected_checks}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Passed: {facility.total_passed_checks}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}