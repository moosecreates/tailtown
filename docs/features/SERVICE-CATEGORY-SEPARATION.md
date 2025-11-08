# Service Category Separation

## Overview
Training services have been separated from the general Services management area to support future modularization and cleaner organization.

## Implementation

### Training Services
- **Dedicated Section**: Training has its own dedicated calendar and class management system
- **Calendar Location**: Training Calendar page (`/training-calendar`)
- **Management Location**: Admin > Training Classes (`/training/classes`)
- **Features**:
  - Training class scheduling
  - Session management
  - Instructor assignment
  - Class capacity management
- **Access Control**: Class management is only accessible through Admin section to prevent staff from accidentally modifying schedules

### General Services
The Services page (`/admin/services`) now manages only:
- **BOARDING** - Overnight boarding services
- **DAYCARE** - Day care services  
- **GROOMING** - Grooming services

### Changes Made (November 2025)

#### Frontend Changes
1. **Services.tsx** - Removed TRAINING tab from category filter
   - Users can no longer filter by TRAINING in the services list
   - Training services are managed through the Training section

2. **ServiceDetails.tsx** - Removed TRAINING from category dropdown
   - When creating/editing services, TRAINING is not available as a category option
   - Prevents accidental creation of training services in the wrong area

3. **TrainingCalendarPage.tsx** - Removed "Manage Classes & Enrollment" button
   - Button removed from Training Calendar page
   - Class management now only accessible via Admin > Training Classes
   - Prevents staff from accidentally modifying class schedules

#### Backend
- No backend changes required
- TRAINING category still exists in the database and enum
- Training Calendar still filters by `ServiceCategory.TRAINING`

## Benefits

### 1. Cleaner Organization
- Training is a distinct business function with different workflows
- Separating it reduces confusion and clutter in the general services area

### 2. Future Modularization
- Makes it easier to sell Training as a separate module
- Training functionality is already isolated in its own pages and components
- Can be extracted into a separate package/module if needed

### 3. Better User Experience
- Users managing day-to-day services don't see training options
- Training staff can focus on their dedicated section
- Reduces cognitive load by showing only relevant options

### 4. Prevents Accidental Changes
- Class management hidden from Training Calendar page
- Only accessible through Admin section
- Reduces risk of staff accidentally modifying class schedules
- Clear separation between viewing (calendar) and managing (admin)

## Migration Notes

### Existing Training Services
- Any existing services with `serviceCategory: 'TRAINING'` remain in the database
- They are still accessible via the Training Calendar
- They will not appear in the general Services page

### Creating New Training Services
- Training services should be created through the Training section
- If needed, they can still be created directly in the database
- The general Services UI no longer allows creating TRAINING services

## Future Considerations

### If Selling Training as Separate Module
1. **Database**: Training services already use the same `services` table with `TRAINING` category
2. **API**: Training-specific endpoints can be isolated in a separate service
3. **Frontend**: Training pages are already in their own section
4. **Dependencies**: Minimal coupling with other service categories

### If Needing to Re-enable Training in Services
Simply remove the filters added in this change:
- Remove `.filter()` from ServiceDetails.tsx line 279
- Add back TRAINING ToggleButton in Services.tsx

## Related Files
- `/frontend/src/pages/services/Services.tsx` - Services list page
- `/frontend/src/pages/services/ServiceDetails.tsx` - Service creation/edit form
- `/frontend/src/pages/calendar/TrainingCalendarPage.tsx` - Training calendar
- `/frontend/src/types/service.ts` - ServiceCategory enum definition

## Testing
After making these changes:
1. ✅ Verify TRAINING tab is not visible on Services page
2. ✅ Verify TRAINING is not in category dropdown when creating/editing services
3. ✅ Verify Training Calendar still shows training services
4. ✅ Verify existing training services are not affected
5. ✅ Verify other categories (BOARDING, DAYCARE, GROOMING) still work normally
