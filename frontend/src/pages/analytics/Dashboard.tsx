import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  // Paper, - Not used
  Button,
  useTheme
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [serviceData, setServiceData] = useState<any>(null);
  const [addonData, setAddonData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042'
  ];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await analyticsService.getDashboardSummary(period);
      const salesByService = await analyticsService.getSalesByService(period);
      const salesByAddon = await analyticsService.getSalesByAddOn(period);
      
      setDashboardData(dashboardData);
      setServiceData(salesByService);
      setAddonData(salesByAddon);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [period]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value);
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'day':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      case 'all':
        return 'All Time';
      default:
        return 'Custom Period';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
        <Button variant="contained" onClick={loadData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Real-time insights into business performance
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="period-select-label">Period</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              label="Period"
              onChange={handlePeriodChange}
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Revenue Summary Section Header */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2, mt: 1 }}>
            Revenue Dashboard ({getPeriodLabel()})
          </Typography>
        </Grid>
        
        {/* REVENUE SECTION HEADER */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" color="text.secondary">Actual Revenue</Typography>
            <Divider sx={{ flexGrow: 1, ml: 2 }} />
          </Box>
        </Grid>
        
        {/* PAID Revenue Cards - Actual Cash Received */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.success.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline" fontWeight="bold">
                PAID REVENUE
              </Typography>
              <Typography variant="h4" color="text.primary">
                {dashboardData?.totalPaid
                  ? formatCurrency(dashboardData.totalPaid)
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                Actual cash received
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                INVOICE PAYMENTS
              </Typography>
              <Typography variant="h4">
                {dashboardData?.paidInvoiceCount
                  ? formatCurrency(dashboardData.totalPaid - (dashboardData.directPaymentsTotal || 0))
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                From {dashboardData?.paidInvoiceCount || 0} paid invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                DIRECT PAYMENTS
              </Typography>
              <Typography variant="h4">
                {dashboardData?.directPaymentsTotal
                  ? formatCurrency(dashboardData.directPaymentsTotal)
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                Cash payments: {dashboardData?.directPaymentsCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* PENDING REVENUE SECTION HEADER */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
            <Typography variant="h6" color="text.secondary">Pending Revenue</Typography>
            <Divider sx={{ flexGrow: 1, ml: 2 }} />
          </Box>
        </Grid>
        
        {/* DEPOSITS & OUTSTANDING REVENUE */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.warning.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline" fontWeight="bold">
                DEPOSITS/PARTIAL PAYMENTS
              </Typography>
              <Typography variant="h4" color="text.primary">
                {dashboardData?.partiallyPaidAmount
                  ? formatCurrency(dashboardData.partiallyPaidAmount)
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                From {dashboardData?.partiallyPaidInvoiceCount || 0} invoices with deposits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                OUTSTANDING
              </Typography>
              <Typography variant="h4" color="warning.main">
                {dashboardData?.totalOutstanding
                  ? formatCurrency(dashboardData.totalOutstanding)
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                Unpaid invoices: {dashboardData?.outstandingInvoiceCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* RESERVED Revenue Cards - Future/Potential Revenue */}
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%', backgroundColor: theme.palette.info.light }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline" fontWeight="bold">
                RESERVED REVENUE
              </Typography>
              <Typography variant="h4" color="text.primary">
                {dashboardData?.reservationValueTotal
                  ? formatCurrency(dashboardData.reservationValueTotal)
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                Scheduled but not invoiced
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                RESERVATIONS
              </Typography>
              <Typography variant="h4">
                {dashboardData?.reservationCount || 0}
              </Typography>
              <Typography variant="caption" display="block">
                Scheduled appointments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* SUMMARY SECTION HEADER */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
            <Typography variant="h6" color="text.secondary">Summary</Typography>
            <Divider sx={{ flexGrow: 1, ml: 2 }} />
          </Box>
        </Grid>

        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                CUSTOMERS
              </Typography>
              <Typography variant="h4">
                {dashboardData?.customerCount || 0}
              </Typography>
              <Typography variant="caption" display="block">
                Unique client count
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <Card sx={{ height: '100%', backgroundColor: '#f0f5ff' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline" fontWeight="bold">
                TOTAL EXPECTED REVENUE
              </Typography>
              <Typography variant="h4">
                {dashboardData?.totalRevenue
                  ? formatCurrency(dashboardData.totalRevenue)
                  : '$0.00'}
              </Typography>
              <Typography variant="caption" display="block">
                Total from all sources
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Service Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Service Revenue" 
              subheader={`${getPeriodLabel()} revenue breakdown by service`}
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 380 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceData?.services || []}
                    margin={{ top: 20, right: 30, left: 40, bottom: 70 }}
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
                      formatter={(value: number) => [formatCurrency(value), '']}
                    />
                    <Bar 
                      dataKey="revenue" 
                      name="Amount" 
                      fill={theme.palette.primary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Service Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Service Distribution" 
              subheader={`${getPeriodLabel()} service usage`}
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 380, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                    <Pie
                      data={serviceData?.services || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                    >
                      {(serviceData?.services || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value} bookings`, 'Count']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Add-On Revenue Table */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Add-On Performance" />
            <Divider />
            <CardContent>
              {addonData?.addOns?.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Add-On</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Sales</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Revenue</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Avg. Price</th>
                        <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addonData.addOns.map((addon: any) => (
                        <tr key={addon.id}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{addon.name}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{addon.count}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{formatCurrency(addon.revenue)}</td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {formatCurrency(addon.count > 0 ? addon.revenue / addon.count : 0)}
                          </td>
                          <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                            {addonData.totalRevenue > 0 
                              ? `${((addon.revenue / addonData.totalRevenue) * 100).toFixed(1)}%` 
                              : '0%'
                            }
                          </td>
                        </tr>
                      ))}
                      <tr style={{ fontWeight: 'bold' }}>
                        <td style={{ padding: '8px', borderTop: '2px solid #ddd' }}>Total</td>
                        <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}>
                          {addonData.addOns.reduce((sum: number, addon: any) => sum + addon.count, 0)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}>
                          {formatCurrency(addonData.totalRevenue)}
                        </td>
                        <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}></td>
                        <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </Box>
              ) : (
                <Typography variant="body1" align="center" sx={{ py: 4 }}>
                  No add-on sales data available for this period.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* View More Analytics */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              component={Link}
              to="/analytics/customers"
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
            >
              Customer Value Report
            </Button>
            <Button
              onClick={() => loadData()}
              variant="outlined"
              color="primary"
            >
              Refresh Data
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
