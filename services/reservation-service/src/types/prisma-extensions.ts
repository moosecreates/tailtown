/**
 * Prisma client extension for multi-tenant support
 * These type extensions are necessary because our schema includes fields like organizationId
 * for multi-tenant isolation, but the Prisma client doesn't recognize them in TypeScript.
 */

import { Prisma, ReservationStatus as PrismaReservationStatus } from '@prisma/client';

// Define tenant-specific types to use with type assertions
export interface TenantFields {
  organizationId: string;
}

// Extend the ReservationStatus enum to include our custom statuses
export enum ExtendedReservationStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED', 
  COMPLETED = 'COMPLETED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  NO_SHOW = 'NO_SHOW',
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  DRAFT = 'DRAFT'
}

// Extend Prisma's WhereInput types to include organizationId
export interface ExtendedReservationWhereInput extends Prisma.ReservationWhereInput {
  organizationId?: string | Prisma.StringFilter;
}
export interface ExtendedCustomerWhereInput extends Prisma.CustomerWhereInput {
  organizationId?: string | Prisma.StringFilter;
}
export interface ExtendedPetWhereInput extends Prisma.PetWhereInput {
  organizationId?: string | Prisma.StringFilter;
}
export interface ExtendedResourceWhereInput extends Prisma.ResourceWhereInput {
  organizationId?: string | Prisma.StringFilter;
}
export interface ExtendedAddOnServiceWhereInput extends Prisma.AddOnServiceWhereInput {
  organizationId?: string | Prisma.StringFilter;
}
export interface ExtendedServiceWhereInput extends Prisma.ServiceWhereInput {
  organizationId?: string | Prisma.StringFilter;
}

// Extend Prisma's model types to include custom fields
export type ExtendedReservation = Prisma.ReservationGetPayload<{}> & {
  suiteType?: string;
  price?: number;
  resource?: Prisma.ResourceGetPayload<{}>;
  addOns?: Prisma.ReservationAddOnGetPayload<{ include: { addOn: true } }>[];
  service?: Prisma.ServiceGetPayload<{}>;
}

// Define interfaces for Prisma include and select options with additional fields
export interface ExtendedReservationInclude extends Omit<Prisma.ReservationInclude, 'service'> {
  // We're keeping this simple to avoid complex Prisma type constraint issues
  addOns?: any;
  service?: boolean | Prisma.ServiceArgs;
}

export interface ExtendedPetSelect extends Prisma.PetSelect {
  id?: boolean;
  name?: boolean;
  breed?: boolean;
  size?: boolean; // Adding size that might be missing from the generated types
}

export interface ExtendedCustomerSelect extends Prisma.CustomerSelect {
  id?: boolean;
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  phone?: boolean;
}

// Interface for creating ReservationAddOn with tenant isolation
export interface ExtendedReservationAddOnCreateInput extends Prisma.ReservationAddOnCreateInput, TenantFields {}

/**
 * This mapping allows us to use type assertions to override Prisma's generated types
 * when we need to use fields not recognized by TypeScript but present in our database.
 * 
 * Example usage:
 * const whereClause = { organizationId: tenantId } as ExtendedReservationWhereInput;
 */
