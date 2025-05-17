import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, useTheme } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

interface RevenueByServiceChartProps {
  data: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  height?: number;
}

const RevenueByServiceChart: React.FC<RevenueByServiceChartProps> = ({ 
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
        No service revenue data available
      </Box>
    );
  }

  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
          <Legend />
          <Bar 
            dataKey="revenue" 
            name="Revenue" 
            fill={theme.palette.primary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RevenueByServiceChart;
