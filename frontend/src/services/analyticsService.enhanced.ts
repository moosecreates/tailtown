/**
 * Enhanced Analytics Service
 * 
 * This service integrates with the backend's new financial service architecture
 * to ensure all financial data comes from a single source of truth.
 * 
 * It includes data quality indicators and last-updated timestamps
 * to increase transparency and trust in the financial reporting.
 */

import api from './api';

// Enhanced interfaces with data quality information
export interface FinancialDataMetadata {
  dataSource: string;
  dataQuality: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export interface SalesByServiceData {
  period: string;
  totalRevenue: number;
  totalBookings?: number;
  services: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  metadata: FinancialDataMetadata;
}

export interface SalesByAddOnData {
  period: string;
  totalRevenue: number;
  addOns: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  metadata: FinancialDataMetadata;
}

export interface CustomerValueData {
  id: string;
  name: string;
  email: string;
  totalSpend: number;
  invoiceCount: number;
  serviceBreakdown: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  addOnBreakdown: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  addOnTotal: number;
  metadata: FinancialDataMetadata;
}

export interface DashboardSummaryData {
  period: string;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  customerCount: number;
  serviceData: {
    id: string;
    name: string;
    count: number;
  }[];
  addOnData: {
    id: string;
    name: string;
    count: number;
    revenue: number;
  }[];
  addOnRevenue: number;
  reservationCount?: number;
  metadata: FinancialDataMetadata;
}

export interface CustomerReportData {
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  period: string;
  totalSpend: number;
  invoiceCount: number;
  serviceBreakdown: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  addOnBreakdown: {
    id: string;
    name: string;
    count: number;
    revenue: number;
    percentageOfTotal: number;
  }[];
  addOnTotal: number;
  transactions: {
    id: string;
    invoiceNumber: string;
    date: string;
    total: number;
    status: string;
    serviceName: string;
    addOns: {
      name: string;
      price: number;
    }[];
  }[];
  metadata: FinancialDataMetadata;
}

export interface AnalyticsResponse<T> {
  status: string;
  data: T;
  results?: number;
}

const enhancedAnalyticsService = {
  /**
   * Get sales data by service type
   * @param period - time period (day, week, month, year, all, custom)
   * @param startDate - start date for custom period (YYYY-MM-DD)
   * @param endDate - end date for custom period (YYYY-MM-DD)
   */
  getSalesByService: async (
    period: string = 'all',
    startDate?: string,
    endDate?: string
  ): Promise<SalesByServiceData> => {
    try {
      let url = `/api/analytics/sales/services?period=${period}`;
      
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get<AnalyticsResponse<SalesByServiceData>>(url);
      
      if (response.data && response.data.status === 'success') {
        // Ensure metadata exists
        if (!response.data.data.metadata) {
          response.data.data.metadata = {
            dataSource: 'Financial Service',
            dataQuality: 'high',
            lastUpdated: new Date().toISOString()
          };
        }
        return response.data.data;
      }
      
      throw new Error('Failed to get sales by service data');
    } catch (error) {
      console.error('Error getting sales by service:', error);
      throw error;
    }
  },
  
  /**
   * Get sales data by add-on type
   * @param period - time period (day, week, month, year, all, custom)
   * @param startDate - start date for custom period (YYYY-MM-DD)
   * @param endDate - end date for custom period (YYYY-MM-DD)
   */
  getSalesByAddOn: async (
    period: string = 'all',
    startDate?: string,
    endDate?: string
  ): Promise<SalesByAddOnData> => {
    try {
      let url = `/api/analytics/sales/addons?period=${period}`;
      
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get<AnalyticsResponse<SalesByAddOnData>>(url);
      
      if (response.data && response.data.status === 'success') {
        // Ensure metadata exists
        if (!response.data.data.metadata) {
          response.data.data.metadata = {
            dataSource: 'Financial Service',
            dataQuality: 'high',
            lastUpdated: new Date().toISOString()
          };
        }
        return response.data.data;
      }
      
      throw new Error('Failed to get sales by add-on data');
    } catch (error) {
      console.error('Error getting sales by add-on:', error);
      throw error;
    }
  },
  
  /**
   * Get customer value data (total spend, breakdown by service type)
   * @param period - time period (day, week, month, year, all, custom)
   * @param startDate - start date for custom period (YYYY-MM-DD)
   * @param endDate - end date for custom period (YYYY-MM-DD)
   */
  getCustomerValue: async (
    period: string = 'all',
    startDate?: string,
    endDate?: string
  ): Promise<CustomerValueData[]> => {
    try {
      let url = `/api/analytics/customers/value?period=${period}`;
      
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get<AnalyticsResponse<CustomerValueData[]>>(url);
      
      if (response.data && response.data.status === 'success') {
        // Ensure metadata exists for each customer value data
        const enhancedData = response.data.data.map(item => {
          if (!item.metadata) {
            return {
              ...item,
              metadata: {
                dataSource: 'Financial Service',
                dataQuality: 'high' as 'high', // Cast to union type
                lastUpdated: new Date().toISOString()
              }
            };
          }
          // Ensure metadata has the correct type
          return {
            ...item,
            metadata: {
              ...item.metadata,
              dataQuality: item.metadata.dataQuality as 'high' | 'medium' | 'low'
            }
          };
        });
        
        return enhancedData;
      }
      
      throw new Error('Failed to get customer value data');
    } catch (error) {
      console.error('Error getting customer value:', error);
      throw error;
    }
  },
  
  /**
   * Get summary analytics data for dashboard
   * @param period - time period (day, week, month, year, all, custom)
   * @param startDate - start date for custom period (YYYY-MM-DD)
   * @param endDate - end date for custom period (YYYY-MM-DD)
   */
  getDashboardSummary: async (
    period: string = 'all',
    startDate?: string,
    endDate?: string
  ): Promise<DashboardSummaryData> => {
    try {
      let url = `/api/analytics/dashboard?period=${period}`;
      
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get<AnalyticsResponse<DashboardSummaryData>>(url);
      
      if (response.data && response.data.status === 'success') {
        // Ensure metadata exists
        if (!response.data.data.metadata) {
          response.data.data.metadata = {
            dataSource: 'Financial Service',
            dataQuality: 'high',
            lastUpdated: new Date().toISOString()
          };
        }
        
        return response.data.data;
      }
      
      throw new Error('Failed to get dashboard summary data');
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      throw error;
    }
  },
  
  /**
   * Get detailed customer report for a specific customer
   * @param customerId - ID of the customer
   * @param period - time period (day, week, month, year, all, custom)
   * @param startDate - start date for custom period (YYYY-MM-DD)
   * @param endDate - end date for custom period (YYYY-MM-DD)
   */
  getCustomerReport: async (
    customerId: string,
    period: string = 'all',
    startDate?: string,
    endDate?: string
  ): Promise<CustomerReportData> => {
    try {
      let url = `/api/analytics/customers/${customerId}?period=${period}`;
      
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      
      const response = await api.get<AnalyticsResponse<CustomerReportData>>(url);
      
      if (response.data && response.data.status === 'success') {
        // Ensure metadata exists
        if (!response.data.data.metadata) {
          response.data.data.metadata = {
            dataSource: 'Financial Service',
            dataQuality: 'high',
            lastUpdated: new Date().toISOString()
          };
        }
        
        return response.data.data;
      }
      
      throw new Error('Failed to get customer report data');
    } catch (error) {
      console.error('Error getting customer report:', error);
      throw error;
    }
  },
  
  /**
   * Validate financial data consistency
   * This is a utility method that can be used to check if financial data
   * is consistent across different reports
   */
  validateFinancialDataConsistency: async (): Promise<{
    isConsistent: boolean;
    discrepancies: string[];
  }> => {
    try {
      const response = await api.get('/api/analytics/validate');
      
      if (response.data && response.data.status === 'success') {
        return response.data.data;
      }
      
      return {
        isConsistent: false,
        discrepancies: ['Failed to validate financial data consistency']
      };
    } catch (error) {
      console.error('Error validating financial data consistency:', error);
      return {
        isConsistent: false,
        discrepancies: ['Error occurred during validation']
      };
    }
  }
};

export default enhancedAnalyticsService;
