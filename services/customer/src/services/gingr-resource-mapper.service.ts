/**
 * Gingr Resource Mapper Service
 * Maps Gingr lodging/kennel data to Tailtown resources
 * 
 * Based on Gingr's lodging system:
 * - Area: "A. Indoor", "B. Outdoor", etc.
 * - Lodging Label: "A 02", "A 01", etc.
 */

// Use native fetch (Node 18+) instead of node-fetch

interface ResourceCache {
  [gingrLodging: string]: string; // Gingr lodging → Tailtown resource ID
}

const resourceCache: ResourceCache = {};

/**
 * Extract lodging/kennel from Gingr reservation data
 * 
 * TODO: Update field names based on actual Gingr API structure
 * Possible field names: lodging_id, lodging_label, lodging, room, kennel
 */
export function extractGingrLodging(reservation: any): string | null {
  // Try multiple possible field names
  const lodging = reservation.lodging_label 
    || reservation.lodging_id
    || reservation.lodging
    || reservation.room_label
    || reservation.room_id
    || reservation.room
    || reservation.kennel_label
    || reservation.kennel_id
    || reservation.kennel
    || reservation.suite_label
    || reservation.suite_id
    || null;
  
  // Also check nested structures
  if (!lodging && reservation.lodging) {
    return reservation.lodging.label || reservation.lodging.id || null;
  }
  
  if (!lodging && reservation.room) {
    return reservation.room.label || reservation.room.id || null;
  }
  
  return lodging;
}

/**
 * Normalize lodging names for consistency
 * Examples:
 *   "A 02" → "A02"
 *   "A. Indoor - A 02" → "A02"
 *   "Suite A02" → "A02"
 */
function normalizeLodgingName(gingrLodging: string): string {
  if (!gingrLodging) return '';
  
  // Remove common prefixes and extra spaces
  let normalized = gingrLodging
    .replace(/^(Suite|Room|Kennel|Lodging)\s+/i, '')
    .replace(/^[A-Z]\.\s*\w+\s*-\s*/i, '') // Remove "A. Indoor - "
    .trim();
  
  // Remove spaces between letter and number: "A 02" → "A02"
  normalized = normalized.replace(/^([A-Z])\s+(\d+)$/, '$1$2');
  
  // Ensure two-digit format: "A2" → "A02"
  const match = normalized.match(/^([A-Z])(\d+)$/);
  if (match) {
    const letter = match[1];
    const number = match[2].padStart(2, '0');
    normalized = `${letter}${number}`;
  }
  
  return normalized;
}

/**
 * Determine resource type from lodging name
 */
function determineResourceType(lodgingName: string): string {
  const name = lodgingName.toUpperCase();
  
  // Check for VIP indicators
  if (name.includes('VIP') || name.startsWith('V') || name.includes('PREMIUM')) {
    return 'VIP_SUITE';
  }
  
  // Check for Plus/Deluxe indicators
  if (name.includes('PLUS') || name.includes('+') || name.includes('DELUXE')) {
    return 'STANDARD_PLUS_SUITE';
  }
  
  // Default to standard
  return 'STANDARD_SUITE';
}

/**
 * Find or create a Tailtown resource matching the Gingr lodging
 */
export async function findOrCreateResource(
  gingrLodging: string,
  reservationServiceUrl: string = 'http://localhost:4003'
): Promise<{ id: string; name: string }> {
  
  if (!gingrLodging) {
    throw new Error('No lodging specified');
  }
  
  // Normalize the lodging name
  const normalizedName = normalizeLodgingName(gingrLodging);
  
  if (!normalizedName) {
    throw new Error(`Could not normalize lodging: ${gingrLodging}`);
  }
  
  // Check cache first
  if (resourceCache[normalizedName]) {
    return { id: resourceCache[normalizedName] as string, name: normalizedName } as { id: string; name: string };
  }
  
  try {
    // Try to find existing resource by name
    const searchResponse = await fetch(
      `${reservationServiceUrl}/api/resources?limit=1000`,
      { headers: { 'x-tenant-id': 'dev' } }
    );
    
    const searchData = await searchResponse.json() as any;
    const resources = searchData.data?.resources || [];
    
    // Look for exact match
    const existingResource = resources.find((r: any) => r.name === normalizedName);
    
    if (existingResource) {
      resourceCache[normalizedName] = existingResource.id;
      console.log(`[Resource Mapper] Found existing resource: ${normalizedName} (${existingResource.id})`);
      return existingResource;
    }
    
    // Resource doesn't exist - create it
    console.log(`[Resource Mapper] Creating new resource: ${normalizedName} (from Gingr: "${gingrLodging}")`);
    
    const createResponse = await fetch(
      `${reservationServiceUrl}/api/resources`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'dev'
        },
        body: JSON.stringify({
          name: normalizedName,
          type: determineResourceType(normalizedName),
          capacity: 1,
          isActive: true,
          tenantId: 'dev',
          description: `Imported from Gingr: ${gingrLodging}`
        })
      }
    );
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Failed to create resource: ${errorText}`);
    }
    
    const newResource = await createResponse.json() as any;
    resourceCache[normalizedName] = newResource.id;
    
    console.log(`[Resource Mapper] ✅ Created resource: ${normalizedName} (${newResource.id})`);
    
    return newResource;
    
  } catch (error: any) {
    console.error(`[Resource Mapper] Error mapping lodging "${gingrLodging}":`, error.message);
    throw error;
  }
}

/**
 * Clear the resource cache (useful for testing)
 */
export function clearResourceCache(): void {
  Object.keys(resourceCache).forEach(key => delete resourceCache[key]);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: Object.keys(resourceCache).length,
    entries: Object.keys(resourceCache)
  };
}
