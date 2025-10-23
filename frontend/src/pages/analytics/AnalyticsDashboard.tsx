import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardHeader,
  Divider,
  useTheme
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
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
  Cell
} from 'recharts';
import analyticsService, {
  DashboardSummaryData,
  SalesByServiceData,
  SalesByAddOnData
} from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const AnalyticsDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<DashboardSummaryData | null>(null);
  const [serviceData, setServiceData] = useState<SalesByServiceData | null>(null);
  const [addonData, setAddonData] = useState<SalesByAddOnData | null>(null);
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
      const [summaryData, servicesSales, addonSales] = await Promise.all([
        analyticsService.getDashboardSummary(period),
        analyticsService.getSalesByService(period),
        analyticsService.getSalesByAddOn(period)
      ]);

      setDashboardData(summaryData);
      setServiceData(servicesSales);
      setAddonData(addonSales);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sales Dashboard
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Gain insights into your business performance and customer behavior
          </Typography>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="period-select-label">Time Period</InputLabel>
            <Select
              labelId="period-select-label"
              id="period-select"
              value={period}
              label="Time Period"
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

      {dashboardData && (
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Revenue
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: 'primary.main' }}>
                  {formatCurrency(dashboardData.totalRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getPeriodLabel()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Active Customers
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: 'secondary.main' }}>
                  {dashboardData.customerCount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getPeriodLabel()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Service Bookings
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: 'success.main' }}>
                  {serviceData?.totalBookings || dashboardData?.reservationCount || dashboardData?.serviceData.reduce((sum, service) => sum + service.count, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getPeriodLabel()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Add-On Revenue
                </Typography>
                <Typography variant="h4" sx={{ mt: 1, color: 'warning.main' }}>
                  {formatCurrency(dashboardData.addOnRevenue)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {getPeriodLabel()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="analytics tabs">
            <Tab label="Services" id="analytics-tab-0" aria-controls="analytics-tabpanel-0" />
            <Tab label="Add-Ons" id="analytics-tab-1" aria-controls="analytics-tabpanel-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {serviceData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Service Revenue Breakdown" />
                  <CardContent>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={serviceData.services}
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Bar 
                            dataKey="revenue" 
                            fill={theme.palette.primary.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Service Bookings" />
                  <CardContent>
                    <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={serviceData.services}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }: { name: string, percent: number }) => 
                              `${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {serviceData.services.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value} bookings`, 'Count']}
                          />
                          <Legend 
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: '20px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Service Performance" />
                  <CardContent>
                    <Box sx={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>Service</th>
                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Bookings</th>
                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Revenue</th>
                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>Avg. Revenue</th>
                            <th style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>% of Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceData.services.map((service) => (
                            <tr key={service.id}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{service.name}</td>
                              <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{service.count}</td>
                              <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>{formatCurrency(service.revenue)}</td>
                              <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                {formatCurrency(service.count > 0 ? service.revenue / service.count : 0)}
                              </td>
                              <td style={{ textAlign: 'right', padding: '8px', borderBottom: '1px solid #ddd' }}>
                                {serviceData.totalRevenue > 0 
                                  ? `${((service.revenue / serviceData.totalRevenue) * 100).toFixed(1)}%` 
                                  : '0%'
                                }
                              </td>
                            </tr>
                          ))}
                          <tr style={{ fontWeight: 'bold' }}>
                            <td style={{ padding: '8px', borderTop: '2px solid #ddd' }}>Total</td>
                            <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}>
                              {serviceData.services.reduce((sum, service) => sum + service.count, 0)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}>
                              {formatCurrency(serviceData.totalRevenue)}
                            </td>
                            <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}></td>
                            <td style={{ textAlign: 'right', padding: '8px', borderTop: '2px solid #ddd' }}>100%</td>
                          </tr>
                        </tbody>
                      </table>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {addonData && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Add-On Revenue Breakdown" />
                  <CardContent>
                    <Box sx={{ height: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={addonData.addOns}
                          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                          />
                          <Tooltip 
                            formatter={(value) => formatCurrency(Number(value))}
                            labelFormatter={(label) => `${label}`}
                          />
                          <Bar 
                            dataKey="revenue" 
                            fill={theme.palette.secondary.main}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Add-On Usage" />
                  <CardContent>
                    <Box sx={{ height: 400, display: 'flex', justifyContent: 'center' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={addonData.addOns}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }: { name: string, percent: number }) => 
                              `${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {addonData.addOns.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]} 
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value} usages`, 'Count']}
                          />
                          <Legend 
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ paddingLeft: '20px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardHeader title="Add-On Performance" />
                  <CardContent>
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
                          {addonData.addOns.map((addon) => (
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
                              {addonData.addOns.reduce((sum, addon) => sum + addon.count, 0)}
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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AnalyticsDashboard;
