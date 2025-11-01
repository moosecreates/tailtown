# Announcement System

**Status**: Frontend Complete | Backend Pending Migration  
**Created**: October 31, 2025  
**Last Updated**: October 31, 2025

## Overview

Complete notification/announcement system for displaying important messages to team members. Features priority levels, type indicators, and per-user dismissal tracking.

## Features

### 1. Announcement Modal
- **Auto-popup on login**: Shows when user accesses Dashboard
- **Multiple announcements**: Navigate through with Previous/Next buttons
- **Dismiss functionality**: Users can dismiss announcements permanently
- **Priority indicators**: Color-coded border based on priority level
- **Type icons**: Visual indicators for INFO, WARNING, SUCCESS, ERROR

### 2. Announcement Bell (Header Icon)
- **Badge counter**: Shows number of active announcements
- **Color coding**: Red badge for URGENT, blue for normal
- **Dropdown preview**: Quick view of announcements without opening modal
- **Click to view all**: Opens full modal with all announcements

### 3. Admin Management Interface
- **Create announcements**: Title, message, priority, type
- **Date range**: Optional start/end dates for time-limited messages
- **Active/Inactive toggle**: Control visibility
- **Edit/Delete**: Full CRUD operations
- **Preview table**: See all announcements with status

## Priority Levels

- **LOW**: Default priority, gray chip
- **NORMAL**: Standard priority, blue chip
- **HIGH**: Important, orange chip
- **URGENT**: Critical, red chip with red badge

## Type Indicators

- **INFO**: Blue info icon
- **WARNING**: Orange warning icon
- **SUCCESS**: Green checkmark icon
- **ERROR**: Red error icon

## Database Schema

### Announcement Table
```prisma
model Announcement {
  id          String   @id @default(uuid())
  tenantId    String   @default("dev")
  
  title       String
  message     String   @db.Text
  priority    String   @default("NORMAL") // LOW, NORMAL, HIGH, URGENT
  type        String   @default("INFO")   // INFO, WARNING, SUCCESS, ERROR
  
  startDate   DateTime @default(now())
  endDate     DateTime? // Optional expiration
  
  isActive    Boolean  @default(true)
  createdBy   String?  // Staff ID who created it
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  dismissals  AnnouncementDismissal[]
}
```

### AnnouncementDismissal Table
```prisma
model AnnouncementDismissal {
  id             String   @id @default(uuid())
  tenantId       String   @default("dev")
  
  announcementId String
  userId         String   // Staff member who dismissed it
  
  dismissedAt    DateTime @default(now())
  
  announcement   Announcement @relation(...)
  
  @@unique([announcementId, userId])
}
```

## API Endpoints

### GET /api/announcements
Get active announcements for current user (excludes dismissed)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "System Maintenance",
      "message": "Scheduled maintenance tonight at 10 PM",
      "priority": "HIGH",
      "type": "WARNING",
      "startDate": "2025-10-31T00:00:00Z",
      "endDate": null,
      "isActive": true,
      "createdAt": "2025-10-31T10:00:00Z"
    }
  ]
}
```

### GET /api/announcements/all
Get all announcements (admin view)

### POST /api/announcements
Create new announcement

**Request Body:**
```json
{
  "title": "Holiday Hours",
  "message": "We will be closed on Thanksgiving",
  "priority": "NORMAL",
  "type": "INFO",
  "startDate": "2025-11-20",
  "endDate": "2025-11-28",
  "isActive": true
}
```

### PUT /api/announcements/:id
Update announcement

### DELETE /api/announcements/:id
Delete announcement

### POST /api/announcements/:id/dismiss
Dismiss announcement for current user

## Frontend Components

### AnnouncementModal.tsx
```typescript
interface AnnouncementModalProps {
  open: boolean;
  announcements: Announcement[];
  onClose: () => void;
  onDismiss: (id: string) => void;
}
```

**Features:**
- Dialog with priority-colored top border
- Type icon and title in header
- Priority chip (if not NORMAL)
- Alert box with message
- Previous/Next navigation for multiple announcements
- Close and Dismiss buttons

### AnnouncementBell.tsx
```typescript
interface AnnouncementBellProps {
  announcements: Announcement[];
  onAnnouncementClick: () => void;
}
```

**Features:**
- Badge with count
- Dropdown menu with preview
- Shows first 5 announcements
- "View all" link if more than 5

### AnnouncementManager.tsx
Admin interface for managing announcements

**Features:**
- Table view with all announcements
- Create/Edit dialog
- Priority and type selectors
- Date range pickers
- Active/Inactive toggle
- Delete confirmation

## Integration Points

### MainLayout.tsx
- Bell icon in header toolbar
- Loads announcements on mount
- Modal for viewing all announcements

### Dashboard.tsx
- Auto-loads announcements on mount
- Shows modal if announcements exist
- Handles dismissal

## Service Layer

### announcementService.ts
```typescript
- getActiveAnnouncements(): Promise<Announcement[]>
- getAllAnnouncements(): Promise<Announcement[]>
- createAnnouncement(data): Promise<Announcement>
- updateAnnouncement(id, data): Promise<Announcement>
- deleteAnnouncement(id): Promise<void>
- dismissAnnouncement(id): Promise<void>
```

## Backend Controller

### announcement.controller.ts
```typescript
- getActiveAnnouncements(req, res)
- getAllAnnouncements(req, res)
- createAnnouncement(req, res)
- updateAnnouncement(req, res)
- deleteAnnouncement(req, res)
- dismissAnnouncement(req, res)
```

## Setup Instructions

### After Data Import Completes:

1. **Run Migration:**
```bash
cd services/customer
npx prisma migrate dev --name add_announcements
npx prisma generate
```

2. **Add Routes:**
Add to `services/customer/src/routes/index.ts`:
```typescript
import * as announcementController from '../controllers/announcement.controller';

// Announcement routes
router.get('/announcements', announcementController.getActiveAnnouncements);
router.get('/announcements/all', announcementController.getAllAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);
router.post('/announcements/:id/dismiss', announcementController.dismissAnnouncement);
```

3. **Add Admin Route:**
Add to `frontend/src/App.tsx`:
```typescript
<Route path="/admin/announcements" element={<AnnouncementManager />} />
```

4. **Restart Services:**
```bash
# Customer service
cd services/customer
npm start

# Frontend
cd frontend
npm start
```

## Usage Examples

### Creating an Announcement

1. Navigate to Admin > Announcements
2. Click "New Announcement"
3. Fill in:
   - Title: "Holiday Schedule"
   - Message: "We will be closed Dec 24-26"
   - Priority: HIGH
   - Type: INFO
   - Start Date: 2025-12-20
   - End Date: 2025-12-27
4. Click "Create"

### User Experience

1. User logs in and navigates to Dashboard
2. Modal automatically pops up with announcement
3. User reads message
4. User clicks "Dismiss" to mark as read
5. Announcement won't show again for this user
6. Bell icon in header shows remaining announcements
7. User can click bell to view all announcements anytime

## Testing Checklist

- [ ] Create announcement with all priority levels
- [ ] Create announcement with all type indicators
- [ ] Set start/end dates and verify visibility
- [ ] Dismiss announcement and verify it doesn't reappear
- [ ] Check bell icon badge count
- [ ] Navigate through multiple announcements
- [ ] Edit existing announcement
- [ ] Delete announcement
- [ ] Verify multi-tenancy (announcements isolated by tenant)
- [ ] Test on mobile (responsive design)

## Future Enhancements

- [ ] Role-based targeting (show to specific roles only)
- [ ] Read receipts (track who has seen each announcement)
- [ ] Rich text editor for message formatting
- [ ] Attachment support (PDFs, images)
- [ ] Email notifications for URGENT announcements
- [ ] Scheduled publishing (create now, publish later)
- [ ] Analytics (view count, dismiss rate)
- [ ] Templates for common announcements

## Notes

- Announcements are tenant-scoped (multi-tenancy support)
- Dismissals are per-user (tracked by userId)
- Expired announcements (past endDate) are automatically filtered
- Inactive announcements are not shown to users
- Admin interface shows all announcements regardless of status
- Bell icon updates in real-time when announcements are dismissed
