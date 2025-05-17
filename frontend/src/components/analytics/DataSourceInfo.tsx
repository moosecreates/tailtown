import React from 'react';
import { 
  Box, 
  Typography, 
  Tooltip, 
  IconButton,
  Popover,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import VerifiedIcon from '@mui/icons-material/Verified';

interface DataSourceInfoProps {
  sourceName: string;
  sourceDescription?: string;
  lastUpdated?: string;
  dataQuality?: 'high' | 'medium' | 'low';
}

/**
 * Component that displays information about the data source
 * for analytics and financial reporting
 */
const DataSourceInfo: React.FC<DataSourceInfoProps> = ({
  sourceName,
  sourceDescription = 'Financial data from central financial service',
  lastUpdated,
  dataQuality = 'high'
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'data-source-popover' : undefined;

  const getDataQualityColor = () => {
    switch (dataQuality) {
      case 'high':
        return 'success.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

  // Format last updated time if provided
  const formattedLastUpdated = lastUpdated 
    ? new Date(lastUpdated).toLocaleString() 
    : 'Unknown';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        Data Source: {sourceName}
        {dataQuality === 'high' && (
          <Tooltip title="Verified Data Source">
            <VerifiedIcon 
              fontSize="small" 
              color="success" 
              sx={{ ml: 0.5 }} 
            />
          </Tooltip>
        )}
      </Typography>
      
      <IconButton 
        size="small" 
        aria-describedby={id}
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <InfoIcon fontSize="small" color="action" />
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ maxWidth: 400, p: 2 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Data Source Information
          </Typography>
          
          <Typography variant="body2" paragraph>
            {sourceDescription}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <List dense>
            <ListItem>
              <ListItemText 
                primary="Source" 
                secondary={sourceName} 
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Last Updated" 
                secondary={formattedLastUpdated} 
              />
            </ListItem>
            
            <ListItem>
              <ListItemText 
                primary="Data Quality" 
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ color: getDataQualityColor(), fontWeight: 'bold' }}
                  >
                    {dataQuality.toUpperCase()}
                  </Typography>
                } 
              />
            </ListItem>
          </List>
        </Paper>
      </Popover>
    </Box>
  );
};

export default DataSourceInfo;
