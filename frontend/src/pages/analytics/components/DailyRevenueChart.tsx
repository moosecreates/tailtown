import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, useTheme } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface DailyRevenueData {
  date: string;
  revenue: number;
}

interface DailyRevenueChartProps {
  data: DailyRevenueData[];
  height?: number;
}

const DailyRevenueChart: React.FC<DailyRevenueChartProps> = ({ 
  data, 
  height = 350 
}) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        No daily revenue data available
      </Box>
    );
  }

  // Format dates for better display (e.g., "May 16")
  const formattedData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayDate" 
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            name="Daily Revenue" 
            stroke={theme.palette.primary.main}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default DailyRevenueChart;
