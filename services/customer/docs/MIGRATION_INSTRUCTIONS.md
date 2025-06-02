# Migration Instructions for Enhanced Reservation System

This document outlines the steps required to apply the database migrations for the new pet care management features in the enhanced reservation system.

## Background

The enhanced reservation system includes new features for:
- Pet feeding preferences management
- Medication tracking and scheduling
- Recurring reservation patterns
- Multi-pet reservation support with lodging preferences

## Migration Steps

1. Ensure the PostgreSQL database is running
2. Navigate to the customer service directory
3. Apply the migration

```bash
cd /Users/robweinstein/CascadeProjects/tailtown/services/customer
npx prisma migrate dev --name enhanced_reservation_pet_care
```

This command will:
- Create a new migration file based on our schema changes
- Apply the migration to your development database
- Generate the updated Prisma client with the new models

## Manual Migration (Alternative)

If the automated migration doesn't work or you need more control, follow these steps:

1. Create a new migration directory with the current date
```bash
mkdir -p prisma/migrations/$(date +%Y%m%d%H%M%S)_enhanced_reservation_pet_care
```

2. Copy the migration file to this directory
```bash
cp prisma/migrations/20250518_enhanced_reservation_pet_care.prisma prisma/migrations/$(date +%Y%m%d%H%M%S)_enhanced_reservation_pet_care/migration.sql
```

3. Apply the migration
```bash
npx prisma migrate resolve --applied $(date +%Y%m%d%H%M%S)_enhanced_reservation_pet_care
npx prisma generate
```

## Post-Migration Steps

After applying the migration:

1. Restart the customer service
```bash
npm run start
```

2. Test the new API endpoints using the examples below

## API Endpoint Examples

### Pet Feeding Preferences

**Get Feeding Preferences for a Pet**
```
GET /api/pet-care/feeding/pet/:petId
```

**Create Feeding Preference**
```
POST /api/pet-care/feeding
Content-Type: application/json

{
  "petId": "pet-id-here",
  "reservationId": "optional-reservation-id",
  "feedingSchedule": ["MORNING", "EVENING"],
  "foodType": "House food",
  "foodAmount": "1 cup",
  "specialInstructions": "Mix with warm water",
  "foodAddIns": ["Pumpkin", "Probiotics"],
  "probioticNeeded": true
}
```

### Pet Medications

**Get Medications for a Pet**
```
GET /api/pet-care/medication/pet/:petId
```

**Create Medication**
```
POST /api/pet-care/medication
Content-Type: application/json

{
  "petId": "pet-id-here",
  "reservationId": "optional-reservation-id",
  "name": "Medication Name",
  "dosage": "5mg",
  "frequency": "TWICE_DAILY",
  "timingSchedule": ["MORNING", "EVENING"],
  "administrationMethod": "WITH_FOOD",
  "specialInstructions": "Keep refrigerated",
  "startDate": "2025-05-18T00:00:00Z",
  "endDate": "2025-05-25T00:00:00Z",
  "isActive": true
}
```

### Recurring Reservation Patterns

**Create Recurring Pattern**
```
POST /api/recurring-reservations/pattern
Content-Type: application/json

{
  "reservationId": "reservation-id-here",
  "frequency": "WEEKLY",
  "daysOfWeek": [1, 3, 5],
  "interval": 1,
  "endDate": "2025-08-18T00:00:00Z",
  "occurrenceLimit": 12
}
```

**Generate Recurring Instances**
```
POST /api/recurring-reservations/pattern/reservation/:reservationId/generate
```

## Troubleshooting

If you encounter any issues with the migration:

1. Check the database logs for errors
2. Ensure all PostgreSQL extensions are properly installed
3. Verify the database permissions for the migration user
4. For direct help, contact the development team
