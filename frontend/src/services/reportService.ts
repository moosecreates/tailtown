/**
 * Report Service
 * API calls for all reporting functionality
 */

import { customerApi } from './api';

// ============================================================================
// Sales Reports
// ============================================================================

export const getSalesDailyReport = async (date: string) => {
  const response = await customerApi.get(`/api/reports/sales/daily?date=${date}`);
  return response.data;
};

export const getSalesWeeklyReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/sales/weekly?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getSalesMonthlyReport = async (year: number, month: number) => {
  const response = await customerApi.get(`/api/reports/sales/monthly?year=${year}&month=${month}`);
  return response.data;
};

export const getSalesYTDReport = async (year: number) => {
  const response = await customerApi.get(`/api/reports/sales/ytd?year=${year}`);
  return response.data;
};

export const getTopCustomersReport = async (startDate: string, endDate: string, limit: number = 10) => {
  const response = await customerApi.get(`/api/reports/sales/top-customers?startDate=${startDate}&endDate=${endDate}&limit=${limit}`);
  return response.data;
};

// ============================================================================
// Tax Reports
// ============================================================================

export const getTaxMonthlyReport = async (year: number, month: number) => {
  const response = await customerApi.get(`/api/reports/tax/monthly?year=${year}&month=${month}`);
  return response.data;
};

export const getTaxQuarterlyReport = async (year: number, quarter: number) => {
  const response = await customerApi.get(`/api/reports/tax/quarterly?year=${year}&quarter=${quarter}`);
  return response.data;
};

export const getTaxAnnualReport = async (year: number) => {
  const response = await customerApi.get(`/api/reports/tax/annual?year=${year}`);
  return response.data;
};

export const getTaxBreakdownReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/tax/breakdown?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// ============================================================================
// Financial Reports
// ============================================================================

export const getFinancialRevenueReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/financial/revenue?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getFinancialProfitLossReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/financial/profit-loss?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getFinancialOutstandingReport = async () => {
  const response = await customerApi.get(`/api/reports/financial/outstanding`);
  return response.data;
};

export const getFinancialRefundsReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/financial/refunds?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// ============================================================================
// Customer Reports
// ============================================================================

export const getCustomerAcquisitionReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/customers/acquisition?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getCustomerRetentionReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/customers/retention?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getCustomerLifetimeValueReport = async (limit: number = 50) => {
  const response = await customerApi.get(`/api/reports/customers/lifetime-value?limit=${limit}`);
  return response.data;
};

export const getCustomerDemographicsReport = async () => {
  const response = await customerApi.get(`/api/reports/customers/demographics`);
  return response.data;
};

export const getCustomerInactiveReport = async (days: number = 90) => {
  const response = await customerApi.get(`/api/reports/customers/inactive?days=${days}`);
  return response.data;
};

// ============================================================================
// Operational Reports
// ============================================================================

export const getOperationalStaffReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/operations/staff?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getOperationalResourcesReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/operations/resources?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getOperationalBookingsReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/operations/bookings?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getOperationalCapacityReport = async (startDate: string, endDate: string) => {
  const response = await customerApi.get(`/api/reports/operations/capacity?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

// ============================================================================
// Export Functions
// ============================================================================

export const exportReportCSV = async (reportData: any) => {
  // Convert report data to CSV
  const headers = Object.keys(reportData.data[0] || {});
  const csvContent = [
    headers.join(','),
    ...reportData.data.map((row: any) => 
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    )
  ].join('\n');
  
  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.reportType}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportReportPDF = async (reportData: any) => {
  // For now, just alert - will implement PDF generation later
  alert('PDF export coming soon! Use CSV export for now.');
};

// ============================================================================
// Helper Functions
// ============================================================================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
