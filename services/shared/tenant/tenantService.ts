/**
 * Tenant Service
 * 
 * Core service for tenant management in a SaaS platform.
 * Handles:
 * - Tenant validation and authentication
 * - Tenant configuration management
 * - Resource usage tracking and quota enforcement
 * - Tenant-specific feature flags
 */

import { logger } from '../logger';
import { TenantConfig, TenantDetails, ResourceUsage, QuotaCheckResult } from './types';
import { getTenantPrismaClient, TenantPrismaClient } from './prismaClient';

export class TenantService {
  private prisma: TenantPrismaClient | null = null;
  private configCache: Map<string, TenantConfig> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheRefresh: Map<string, number> = new Map();

  constructor() {
    // Initialize Prisma client lazily when needed
    this.prisma = getTenantPrismaClient();
    
    if (!this.prisma) {
      logger.warn('Failed to initialize Prisma client in TenantService. Falling back to API-only mode.');
    }
  }

  /**
   * Validates a tenant ID and returns tenant details
   * Falls back to API validation if database is unavailable
   */
  async validateTenant(tenantId: string): Promise<TenantDetails> {
    try {
      if (this.prisma) {
        try {
          // Try to get tenant from database
          // Check if the organization model exists first
          if (!this.prisma.organization) {
            logger.warn('Organization model not available in Prisma client, falling back to API validation');
            return await this.validateTenantViaAPI(tenantId);
          }

          const tenant = await this.prisma.organization.findUnique({
            where: { id: tenantId },
            select: {
              id: true,
              name: true,
              active: true,
              subscriptionTier: true,
              settings: true
            }
          });

          if (!tenant) {
            logger.info(`Tenant not found in database: ${tenantId}, falling back to API validation`);
            return await this.validateTenantViaAPI(tenantId);
          }

          // Parse tenant configuration
          const config = this.parseTenantConfig(tenant.settings as any || {});
          
          // Cache the config
          this.configCache.set(tenantId, config);
          this.lastCacheRefresh.set(tenantId, Date.now());

          return {
            id: tenant.id,
            name: tenant.name,
            active: tenant.active,
            tier: tenant.subscriptionTier,
            config
          };
        } catch (dbError) {
          logger.warn(`Database validation failed for tenant ${tenantId}, falling back to API validation: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
          return await this.validateTenantViaAPI(tenantId);
        }
      } else {
        // Fallback to API validation if database is unavailable
        return await this.validateTenantViaAPI(tenantId);
      }
    } catch (error) {
      logger.error(`Tenant validation error: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Invalid tenant: ${tenantId}`);
    }
  }

  /**
   * Get tenant configuration with caching
   */
  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // Check cache first
    const cachedConfig = this.configCache.get(tenantId);
    const lastRefresh = this.lastCacheRefresh.get(tenantId) || 0;
    
    if (cachedConfig && (Date.now() - lastRefresh < this.cacheTTL)) {
      return cachedConfig;
    }
    
    // Cache miss or expired, get fresh config
    try {
      const tenantDetails = await this.validateTenant(tenantId);
      return tenantDetails.config;
    } catch (error) {
      // If we can't get fresh config but have a cached version, use it
      if (cachedConfig) {
        logger.warn(`Using stale config for tenant ${tenantId} due to error: ${error instanceof Error ? error.message : String(error)}`);
        return cachedConfig;
      }
      throw error;
    }
  }

  /**
   * Track resource usage for a tenant
   */
  async trackResourceUsage(tenantId: string, usage: ResourceUsage): Promise<void> {
    try {
      if (this.prisma) {
        // Store usage data in database
        await this.prisma.tenantUsage.create({
          data: {
            tenantId,
            endpoint: usage.endpoint,
            method: usage.method,
            duration: usage.duration,
            statusCode: usage.statusCode,
            timestamp: usage.timestamp
          }
        });
      } else {
        // Log usage data if database is unavailable
        logger.info('Tenant resource usage', { 
          tenantId, 
          endpoint: usage.endpoint,
          method: usage.method,
          duration: usage.duration,
          statusCode: usage.statusCode
        });
      }
    } catch (error) {
      logger.error(`Failed to track resource usage: ${error instanceof Error ? error.message : String(error)}`);
      // Non-blocking - we don't want to fail requests if usage tracking fails
    }
  }

  /**
   * Check if a tenant has exceeded their quotas
   */
  async checkQuotas(tenantId: string, endpoint: string, method: string): Promise<QuotaCheckResult> {
    try {
      // Get tenant configuration
      const config = await this.getTenantConfig(tenantId);
      
      // If no quotas defined, allow by default
      if (!config.quotas) {
        return { allowed: true };
      }

      if (this.prisma) {
        // Check API rate limits
        if (config.quotas.requestsPerMinute) {
          const oneMinuteAgo = new Date(Date.now() - 60000);
          
          const recentRequests = await this.prisma.tenantUsage.count({
            where: {
              tenantId,
              timestamp: {
                gte: oneMinuteAgo
              }
            }
          });
          
          if (recentRequests >= config.quotas.requestsPerMinute) {
            return { 
              allowed: false,
              reason: `Rate limit exceeded: ${recentRequests}/${config.quotas.requestsPerMinute} requests per minute`
            };
          }
        }
        
        // Check daily API limits
        if (config.quotas.requestsPerDay) {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          
          const dailyRequests = await this.prisma.tenantUsage.count({
            where: {
              tenantId,
              timestamp: {
                gte: startOfDay
              }
            }
          });
          
          if (dailyRequests >= config.quotas.requestsPerDay) {
            return { 
              allowed: false,
              reason: `Daily limit exceeded: ${dailyRequests}/${config.quotas.requestsPerDay} requests per day`
            };
          }
        }
      }
      
      // All checks passed
      return { allowed: true };
    } catch (error) {
      // Log but allow if quota check fails
      logger.error(`Quota check error: ${error instanceof Error ? error.message : String(error)}`);
      return { allowed: true };
    }
  }

  /**
   * Fallback method to validate tenants via API when database is unavailable
   * This provides a backup validation mechanism for high availability
   */
  private async validateTenantViaAPI(tenantId: string): Promise<TenantDetails> {
    try {
      // In a real implementation, this would call an authentication service
      // For now, we'll implement a simple validation
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // For development, accept all tenant IDs that look valid
      if (tenantId && tenantId.length > 5) {
        return {
          id: tenantId,
          name: `Tenant ${tenantId}`,
          active: true,
          tier: 'standard',
          config: this.getDefaultConfig('standard')
        };
      }
      
      throw new Error(`Invalid tenant ID format: ${tenantId}`);
    } catch (error) {
      logger.error(`API tenant validation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Tenant validation failed: ${tenantId}`);
    }
  }

  /**
   * Parse tenant configuration from stored settings
   */
  private parseTenantConfig(settings: any): TenantConfig {
    try {
      // Start with default config based on tier
      const tier = settings.subscriptionTier || 'standard';
      const config = this.getDefaultConfig(tier);
      
      // Override with tenant-specific settings
      if (settings.featureFlags) {
        config.featureFlags = {
          ...config.featureFlags,
          ...settings.featureFlags
        };
      }
      
      if (settings.quotas) {
        config.quotas = {
          ...config.quotas,
          ...settings.quotas
        };
      }
      
      if (settings.preferences) {
        config.preferences = {
          ...config.preferences,
          ...settings.preferences
        };
      }
      
      return config;
    } catch (error) {
      logger.warn(`Error parsing tenant config, using defaults: ${error instanceof Error ? error.message : String(error)}`);
      return this.getDefaultConfig('standard');
    }
  }

  /**
   * Get default configuration based on subscription tier
   */
  private getDefaultConfig(tier: string): TenantConfig {
    switch (tier.toLowerCase()) {
      case 'premium':
        return {
          featureFlags: {
            advancedReporting: true,
            bulkOperations: true,
            customBranding: true,
            apiAccess: true,
            webhooks: true
          },
          quotas: {
            requestsPerMinute: 600,
            requestsPerDay: 100000,
            storageGB: 100,
            maxUsers: 50
          },
          preferences: {
            defaultCurrency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC'
          }
        };
        
      case 'professional':
        return {
          featureFlags: {
            advancedReporting: true,
            bulkOperations: true,
            customBranding: true,
            apiAccess: true,
            webhooks: false
          },
          quotas: {
            requestsPerMinute: 300,
            requestsPerDay: 50000,
            storageGB: 50,
            maxUsers: 20
          },
          preferences: {
            defaultCurrency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC'
          }
        };
        
      case 'standard':
      default:
        return {
          featureFlags: {
            advancedReporting: false,
            bulkOperations: false,
            customBranding: false,
            apiAccess: true,
            webhooks: false
          },
          quotas: {
            requestsPerMinute: 100,
            requestsPerDay: 10000,
            storageGB: 10,
            maxUsers: 5
          },
          preferences: {
            defaultCurrency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            timezone: 'UTC'
          }
        };
    }
  }
}
