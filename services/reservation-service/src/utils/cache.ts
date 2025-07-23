/**
 * Cache Utility
 * 
 * Simple in-memory cache implementation with TTL and size limits
 * For production, consider using Redis or another distributed cache
 */

import { logger } from './logger';

interface CacheItem<T> {
  data: T;
  expiry: number; // Timestamp when this item expires
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in the cache
}

export class Cache<T> {
  private items: Map<string, CacheItem<T>>;
  private ttl: number;
  private maxSize: number;
  private hits: number = 0;
  private misses: number = 0;
  private name: string;

  constructor(name: string, options: CacheOptions = {}) {
    this.name = name;
    this.items = new Map();
    this.ttl = options.ttl || 5 * 60 * 1000; // Default 5 minutes
    this.maxSize = options.maxSize || 100; // Default 100 items
    
    logger.info(`Cache initialized: ${name}`, {
      ttl: this.ttl,
      maxSize: this.maxSize
    });
    
    // Set up automatic cleanup every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  set(key: string, data: T): void {
    // Ensure we don't exceed max size
    if (this.items.size >= this.maxSize) {
      // Remove oldest item
      const oldestKey = this.items.keys().next().value;
      if (oldestKey) {
        this.items.delete(oldestKey);
        logger.debug(`Cache ${this.name}: Removed oldest item to make space`, { key: oldestKey });
      }
    }
    
    this.items.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
    
    logger.debug(`Cache ${this.name}: Set item`, { key, itemCount: this.items.size });
  }

  get(key: string): T | null {
    const item = this.items.get(key);
    
    if (!item) {
      this.misses++;
      logger.debug(`Cache ${this.name}: Miss`, { key, misses: this.misses });
      return null;
    }
    
    // Check if expired
    if (Date.now() > item.expiry) {
      this.items.delete(key);
      this.misses++;
      logger.debug(`Cache ${this.name}: Expired`, { key, misses: this.misses });
      return null;
    }
    
    this.hits++;
    logger.debug(`Cache ${this.name}: Hit`, { key, hits: this.hits });
    return item.data;
  }

  delete(key: string): void {
    this.items.delete(key);
    logger.debug(`Cache ${this.name}: Deleted item`, { key });
  }
  
  /**
   * Delete all items that match a specific pattern
   * Useful for invalidating groups of related cache entries
   * 
   * @param pattern - String pattern to match against cache keys
   * @returns The number of items deleted
   */
  deleteByPattern(pattern: string): number {
    let deletedCount = 0;
    const keysToDelete: string[] = [];
    
    // First identify all keys that match the pattern
    for (const key of this.items.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    // Then delete them
    for (const key of keysToDelete) {
      this.items.delete(key);
      deletedCount++;
    }
    
    if (deletedCount > 0) {
      logger.info(`Cache ${this.name}: Deleted ${deletedCount} items matching pattern`, { 
        pattern, 
        deletedCount,
        remaining: this.items.size 
      });
    }
    
    return deletedCount;
  }

  clear(): void {
    this.items.clear();
    logger.info(`Cache ${this.name}: Cleared all items`);
  }

  getStats(): { size: number, hits: number, misses: number, hitRate: number } {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests === 0 ? 0 : this.hits / totalRequests;
    return {
      size: this.items.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: parseFloat(hitRate.toFixed(2))
    };
  }

  private cleanup(): void {
    const now = Date.now();
    let expired = 0;
    
    for (const [key, item] of this.items.entries()) {
      if (now > item.expiry) {
        this.items.delete(key);
        expired++;
      }
    }
    
    if (expired > 0) {
      logger.debug(`Cache ${this.name}: Cleaned up expired items`, { 
        expired,
        remaining: this.items.size
      });
    }
  }
}

// Create shared cache instances
export const reservationCache = new Cache<any>('reservations', { ttl: 2 * 60 * 1000 }); // 2 minutes TTL
export const resourceAvailabilityCache = new Cache<any>('resourceAvailability', { ttl: 30 * 1000 }); // 30 seconds TTL

/**
 * Cache invalidation helpers
 * These functions ensure data consistency when entities are modified
 */

/**
 * Invalidate reservation-related caches when a reservation is created, updated, or deleted
 * 
 * @param tenantId - The organization/tenant ID
 * @param reservationId - The specific reservation ID (optional for targeted invalidation)
 */
export function invalidateReservationCaches(tenantId: string, reservationId?: string): void {
  // Log the invalidation operation
  logger.info(`Invalidating reservation caches`, { tenantId, reservationId });
  
  // If we have a specific reservation ID, invalidate its individual cache entry
  if (reservationId) {
    const singleReservationKey = `reservation:${tenantId}:${reservationId}`;
    reservationCache.delete(singleReservationKey);
  }
  
  // Invalidate reservation list caches - this requires pattern matching
  // since we don't know which pages/filters might be cached
  // We'll have to clear all list caches for this tenant
  const keysToDelete: string[] = [];
  
  // Since Map doesn't have a direct way to get all keys by pattern,
  // we'll have to add a method to help with this in the Cache class
  reservationCache.deleteByPattern(`reservations:${tenantId}:`);
  
  // Also invalidate resource availability caches as reservation changes affect availability
  resourceAvailabilityCache.deleteByPattern(`availability:${tenantId}:`);
  
  logger.debug(`Reservation caches invalidated`, { tenantId });
}

/**
 * Invalidate all caches for a specific tenant
 * Use this when doing bulk operations or data migrations
 * 
 * @param tenantId - The organization/tenant ID to invalidate
 */
export function invalidateAllTenantCaches(tenantId: string): void {
  logger.info(`Invalidating all tenant caches`, { tenantId });
  
  // Clear all tenant-specific caches
  reservationCache.deleteByPattern(`${tenantId}:`);
  resourceAvailabilityCache.deleteByPattern(`${tenantId}:`);
  
  logger.info(`All tenant caches invalidated`, { tenantId });
}
