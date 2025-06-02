import { z } from 'zod';
import { ReservationStatus } from '@prisma/client';

// Define the suite type enum based on the previously identified validation requirements
export const SuiteTypeEnum = z.enum(['VIP_SUITE', 'STANDARD_PLUS_SUITE', 'STANDARD_SUITE']);
export type SuiteType = z.infer<typeof SuiteTypeEnum>;

// Schema for creating a new reservation
export const createReservationSchema = z.object({
  customerId: z.string().uuid(),
  petId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.nativeEnum(ReservationStatus).default('CONFIRMED'),
  suiteType: SuiteTypeEnum,
  resourceId: z.string().uuid().optional(),
  notes: z.string().optional(),
  staffNotes: z.string().optional(),
  services: z.array(z.string().uuid()).optional(),
  price: z.number().nonnegative().optional(),
  deposit: z.number().nonnegative().optional(),
  balance: z.number().optional()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Schema for updating an existing reservation
export const updateReservationSchema = z.object({
  customerId: z.string().uuid().optional(),
  petId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.nativeEnum(ReservationStatus).optional(),
  suiteType: SuiteTypeEnum.optional(),
  resourceId: z.string().uuid().optional(),
  notes: z.string().optional(),
  staffNotes: z.string().optional(),
  services: z.array(z.string().uuid()).optional(),
  price: z.number().nonnegative().optional(),
  deposit: z.number().nonnegative().optional(),
  balance: z.number().optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Schema for filtering reservations by date range
export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});

// Schema for adding add-ons to a reservation
export const addOnsSchema = z.object({
  addOns: z.array(z.object({
    serviceId: z.string().uuid(),
    quantity: z.number().int().positive().default(1)
  }))
});

// Helper schema for kennel availability check
export const kennelAvailabilitySchema = z.object({
  kennelId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reservationId: z.string().uuid().optional() // Exclude current reservation when checking for updates
});
