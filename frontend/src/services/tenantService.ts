import axios from 'axios';

const API_URL = process.env.REACT_APP_CUSTOMER_SERVICE_URL || 'http://localhost:4004';

export interface Tenant {
  id: string;
  businessName: string;
  subdomain: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'DELETED' | 'PENDING';
  isActive: boolean;
  isPaused: boolean;
  planType: string;
  billingEmail?: string;
  maxEmployees: number;
  maxLocations: number;
  trialEndsAt?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  pausedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  employeeCount: number;
  customerCount: number;
  reservationCount: number;
  storageUsedMB: number;
  users?: TenantUser[];
}

export interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateTenantDto {
  businessName: string;
  subdomain: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  planType?: string;
  maxEmployees?: number;
  timezone?: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateTenantDto {
  businessName?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  planType?: string;
  maxEmployees?: number;
  maxLocations?: number;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
}

export interface TenantUsage {
  customerCount: number;
  reservationCount: number;
  employeeCount: number;
}

class TenantService {
  /**
   * Get all tenants
   */
  async getAllTenants(filters?: {
    status?: string;
    isActive?: boolean;
    isPaused?: boolean;
  }): Promise<Tenant[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.isPaused !== undefined) params.append('isPaused', filters.isPaused.toString());

    const response = await axios.get(`${API_URL}/api/tenants?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get tenant by ID
   */
  async getTenantById(id: string): Promise<Tenant> {
    const response = await axios.get(`${API_URL}/api/tenants/${id}`);
    return response.data.data;
  }

  /**
   * Get tenant by subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<Tenant> {
    const response = await axios.get(`${API_URL}/api/tenants/subdomain/${subdomain}`);
    return response.data.data;
  }

  /**
   * Create new tenant
   */
  async createTenant(data: CreateTenantDto): Promise<Tenant> {
    const response = await axios.post(`${API_URL}/api/tenants`, data);
    return response.data.data;
  }

  /**
   * Update tenant
   */
  async updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant> {
    const response = await axios.put(`${API_URL}/api/tenants/${id}`, data);
    return response.data.data;
  }

  /**
   * Pause tenant
   */
  async pauseTenant(id: string): Promise<Tenant> {
    const response = await axios.post(`${API_URL}/api/tenants/${id}/pause`);
    return response.data.data;
  }

  /**
   * Reactivate tenant
   */
  async reactivateTenant(id: string): Promise<Tenant> {
    const response = await axios.post(`${API_URL}/api/tenants/${id}/reactivate`);
    return response.data.data;
  }

  /**
   * Delete tenant (soft delete)
   */
  async deleteTenant(id: string): Promise<Tenant> {
    const response = await axios.delete(`${API_URL}/api/tenants/${id}`);
    return response.data.data;
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(id: string): Promise<TenantUsage> {
    const response = await axios.get(`${API_URL}/api/tenants/${id}/usage`);
    return response.data.data;
  }
}

export const tenantService = new TenantService();
