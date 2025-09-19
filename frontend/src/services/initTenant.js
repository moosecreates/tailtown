/**
 * Auto-initializes the tenant ID for Tailtown services.
 * 
 * This script is imported by index.js to ensure tenant ID is set before any API calls.
 * It sets the tenant ID to "dev" if no tenant ID is found in localStorage.
 */

const DEFAULT_TENANT_ID = 'dev';

function initTenantId() {
  try {
    const existingTenantId = 
      localStorage.getItem('tailtown_tenant_id') || 
      localStorage.getItem('tenantId');
    
    if (!existingTenantId) {
      console.log('No tenant ID found in localStorage. Setting default tenant ID:', DEFAULT_TENANT_ID);
      localStorage.setItem('tailtown_tenant_id', DEFAULT_TENANT_ID);
    } else {
      console.log('Found existing tenant ID:', existingTenantId);
    }
  } catch (error) {
    console.error('Error initializing tenant ID:', error);
  }
}

// Run immediately when imported
initTenantId();

export default initTenantId;
