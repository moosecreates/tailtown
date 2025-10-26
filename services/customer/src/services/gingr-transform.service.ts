/**
 * Gingr Data Transformation Service
 * Transforms Gingr data structures to Tailtown format
 */

interface GingrOwner {
  system_id: string;
  first_name: string;
  last_name: string;
  email: string;
  cell_phone?: string;
  home_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

interface GingrAnimal {
  id: string;
  owner_id: string;
  name: string;
  species?: string;
  breed?: string;
  color?: string;
  gender?: string;
  birthday?: number;
  weight?: number;
  microchip?: string;
  vet_name?: string;
  vet_phone?: string;
  medications?: string;
  allergies?: string;
  special_needs?: string;
  notes?: string;
}

interface GingrReservation {
  id: string;
  owner_id: string;
  animal_id: string;
  type_id: string;
  start_date: number;
  end_date: number;
  status_id: number;
  check_in_stamp?: number;
  check_out_stamp?: number;
  notes?: string;
  total_amount?: number;
}

/**
 * Transform Gingr owner to Tailtown customer
 */
export function transformOwnerToCustomer(owner: GingrOwner) {
  return {
    firstName: owner.first_name || '',
    lastName: owner.last_name || '',
    email: owner.email || '',
    phone: owner.cell_phone || owner.home_phone || '',
    address: owner.address || '',
    city: owner.city || '',
    state: owner.state || '',
    zipCode: owner.zip || '',
    emergencyContactName: owner.emergency_contact_name || '',
    emergencyContactPhone: owner.emergency_contact_phone || '',
    notes: stripHtml(owner.notes || ''),
    // Store Gingr ID for reference during migration
    externalId: owner.system_id,
    tenantId: 'dev' // Will be replaced with actual tenant ID
  };
}

/**
 * Transform Gingr animal to Tailtown pet
 */
export function transformAnimalToPet(animal: GingrAnimal, customerId: string) {
  return {
    customerId,
    name: animal.name || 'Unknown',
    species: animal.species || 'Dog',
    breed: animal.breed || 'Mixed',
    color: animal.color || '',
    gender: animal.gender || 'UNKNOWN',
    birthDate: animal.birthday ? new Date(animal.birthday * 1000) : null,
    weight: animal.weight || null,
    microchipNumber: animal.microchip || '',
    veterinarianName: animal.vet_name || '',
    veterinarianPhone: animal.vet_phone || '',
    medications: animal.medications || '',
    allergies: animal.allergies || '',
    specialNeeds: animal.special_needs || '',
    notes: stripHtml(animal.notes || ''),
    isActive: true,
    // Store Gingr ID for reference
    externalId: animal.id,
    tenantId: 'dev'
  };
}

/**
 * Transform Gingr reservation status to Tailtown status
 */
export function transformReservationStatus(statusId: number): string {
  // Gingr status mapping (common values)
  const statusMap: Record<number, string> = {
    1: 'PENDING',      // Pending/Requested
    2: 'CONFIRMED',    // Confirmed
    3: 'CHECKED_IN',   // Checked In
    4: 'CHECKED_OUT',  // Checked Out
    5: 'COMPLETED',    // Completed
    6: 'CANCELLED',    // Cancelled
    7: 'NO_SHOW',      // No Show
  };
  
  return statusMap[statusId] || 'PENDING';
}

/**
 * Transform Gingr reservation to Tailtown reservation
 */
export function transformReservationToReservation(
  reservation: GingrReservation,
  customerId: string,
  petId: string,
  serviceId: string
) {
  return {
    customerId,
    petId,
    serviceId,
    startDate: new Date(reservation.start_date * 1000),
    endDate: new Date(reservation.end_date * 1000),
    status: transformReservationStatus(reservation.status_id),
    notes: stripHtml(reservation.notes || ''),
    checkInTime: reservation.check_in_stamp ? new Date(reservation.check_in_stamp * 1000) : null,
    checkOutTime: reservation.check_out_stamp ? new Date(reservation.check_out_stamp * 1000) : null,
    // Store Gingr ID for reference
    externalId: reservation.id,
    tenantId: 'dev'
  };
}

/**
 * Strip HTML tags from text (Gingr uses HTML in notes)
 */
function stripHtml(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<br\s*\/?>/gi, '\n')  // Convert <br> to newlines
    .replace(/<\/p>/gi, '\n\n')     // Convert </p> to double newlines
    .replace(/<[^>]+>/g, '')        // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')        // Convert &nbsp; to spaces
    .replace(/&amp;/g, '&')         // Convert &amp; to &
    .replace(/&lt;/g, '<')          // Convert &lt; to <
    .replace(/&gt;/g, '>')          // Convert &gt; to >
    .replace(/&quot;/g, '"')        // Convert &quot; to "
    .trim();
}

/**
 * Format phone number to consistent format
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX if 10 digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if can't format
  return phone;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate unique order number for reservation
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

export default {
  transformOwnerToCustomer,
  transformAnimalToPet,
  transformReservationToReservation,
  transformReservationStatus,
  formatPhoneNumber,
  isValidEmail,
  generateOrderNumber
};
