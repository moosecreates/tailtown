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

interface CustomerData {
  id: string;
  name: string;
  email: string;
  totalSpend: number;
  invoiceCount: number;
}

interface CustomerValueChartProps {
  data: CustomerData[];
  height?: number;
  maxCustomers?: number;
}

const CustomerValueChart: React.FC<CustomerValueChartProps> = ({ 
  data, 
  height = 350,
  maxCustomers = 10
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
        No customer value data available
      </Box>
    );
  }

  // Sort data by totalSpend in descending order and take top N customers
  const sortedData = [...data]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, maxCustomers);

  return (
    <Box sx={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            tickFormatter={(value) => formatCurrency(value)}
          />
          <YAxis 
            dataKey="name" 
            type="category"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Total Spend']}
          />
          <Legend />
          <Bar 
            dataKey="totalSpend" 
            name="Total Customer Spend" 
            fill={theme.palette.secondary.main}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default CustomerValueChart;
