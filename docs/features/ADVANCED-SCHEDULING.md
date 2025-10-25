# Advanced Scheduling Features

**Status**: 🚧 In Progress  
**Date Started**: October 25, 2025  
**Target Completion**: November 2025

---

## Overview

Two interconnected scheduling features that enhance operational capabilities:
1. **Groomer-Specific Scheduling** - Resource-based appointment scheduling
2. **Multi-Week Training Classes** - Recurring class series management

---

## Feature 1: Groomer-Specific Scheduling

### Business Requirements

#### Core Functionality
- Tie grooming appointments to individual groomers
- Per-groomer capacity limits
- Groomer availability management
- Skill-based groomer assignment
- Customer groomer preferences
- Break time management
- Groomer performance tracking

#### Key Scenarios
1. **Booking Flow**: Customer books grooming → System shows available groomers → Select preferred groomer → Confirm appointment
2. **Groomer View**: Groomer sees their daily schedule with appointments, breaks, and notes
3. **Admin View**: Manager sees all groomers' schedules, can reassign appointments
4. **Availability Management**: Groomers set their working hours, breaks, time off

### Technical Design

#### Database Schema Extensions

```prisma
model Staff {
  // Existing fields...
  specialties          String[]  // e.g., ["GROOMING", "BATHING", "NAIL_TRIM"]
  groomingSkills       Json?     // Detailed skills: breeds, services
  maxAppointmentsPerDay Int?     // Capacity limit
  averageServiceTime   Int?      // Minutes per appointment
  customerPreferences  GroomerPreference[]
  groomerAppointments  GroomerAppointment[]
}

model GroomerAppointment {
  id              String   @id @default(uuid())
  tenantId        String   @default("dev")
  reservationId   String
  groomerId       String
  serviceId       String
  petId           String
  customerId      String
  scheduledDate   DateTime
  scheduledTime   String
  duration        Int      // Minutes
  status          String   // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  actualStartTime DateTime?
  actualEndTime   DateTime?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  reservation     Reservation @relation(...)
  groomer         Staff       @relation(...)
  service         Service     @relation(...)
  pet             Pet         @relation(...)
  customer        Customer    @relation(...)
  
  @@index([groomerId, scheduledDate])
  @@index([tenantId, groomerId, status])
}

model GroomerPreference {
  id         String   @id @default(uuid())
  tenantId   String   @default("dev")
  customerId String
  groomerId  String
  petId      String?
  priority   Int      @default(1) // 1=preferred, 2=acceptable, 3=avoid
  notes      String?
  createdAt  DateTime @default(now())
  
  customer   Customer @relation(...)
  groomer    Staff    @relation(...)
  pet        Pet?     @relation(...)
  
  @@unique([tenantId, customerId, groomerId, petId])
}

model GroomerBreak {
  id        String   @id @default(uuid())
  tenantId  String   @default("dev")
  groomerId String
  date      DateTime
  startTime String
  endTime   String
  type      String   // LUNCH, BREAK, PERSONAL
  notes     String?
  createdAt DateTime @default(now())
  
  groomer   Staff    @relation(...)
  
  @@index([groomerId, date])
}
```

#### API Endpoints

**Groomer Management**
- `GET /api/groomers` - List all groomers with availability
- `GET /api/groomers/:id` - Get groomer details and schedule
- `PUT /api/groomers/:id/availability` - Update groomer availability
- `GET /api/groomers/:id/schedule` - Get groomer's schedule for date range
- `POST /api/groomers/:id/breaks` - Add break time
- `GET /api/groomers/available` - Find available groomers for date/time

**Appointment Management**
- `POST /api/groomer-appointments` - Create grooming appointment
- `PUT /api/groomer-appointments/:id` - Update appointment
- `PUT /api/groomer-appointments/:id/reassign` - Reassign to different groomer
- `PUT /api/groomer-appointments/:id/status` - Update status (start, complete, cancel)
- `GET /api/groomer-appointments` - List appointments (with filters)

**Customer Preferences**
- `GET /api/customers/:id/groomer-preferences` - Get customer's groomer preferences
- `POST /api/customers/:id/groomer-preferences` - Set groomer preference
- `PUT /api/groomer-preferences/:id` - Update preference

#### Frontend Components

**Admin Interface**
- `GroomerScheduleCalendar.tsx` - Weekly view of all groomers
- `GroomerAvailabilityManager.tsx` - Set groomer working hours
- `GroomerAppointmentDetails.tsx` - Appointment details and management
- `GroomerPerformanceReport.tsx` - Stats and metrics

**Groomer Interface**
- `MySchedule.tsx` - Groomer's personal schedule view
- `AppointmentChecklist.tsx` - Service checklist for each appointment
- `BreakTimeManager.tsx` - Request breaks and time off

**Customer Interface**
- `GroomerSelection.tsx` - Choose preferred groomer during booking
- `GroomerProfile.tsx` - View groomer bio, specialties, reviews

---

## Feature 2: Multi-Week Training Classes

### Business Requirements

#### Core Functionality
- Create recurring class schedules (e.g., 8-week puppy training)
- Class capacity limits
- Weekly session tracking
- Multi-day class support (e.g., Mon/Wed/Fri)
- Attendance tracking
- Class roster management
- Waitlist functionality
- Automatic enrollment for series
- Progress tracking per student

#### Key Scenarios
1. **Class Creation**: Admin creates "Puppy Training 101" - 8 weeks, Saturdays 10am-11am, max 10 dogs
2. **Enrollment**: Customer enrolls dog in class series → Pays for full series → Gets confirmation
3. **Weekly Sessions**: Trainer marks attendance each week, adds notes on progress
4. **Completion**: After 8 weeks, dog gets completion certificate

### Technical Design

#### Database Schema

```prisma
model TrainingClass {
  id              String   @id @default(uuid())
  tenantId        String   @default("dev")
  name            String
  description     String?
  level           String   // BEGINNER, INTERMEDIATE, ADVANCED
  category        String   // PUPPY, OBEDIENCE, AGILITY, BEHAVIOR
  instructorId    String
  maxCapacity     Int
  currentEnrolled Int      @default(0)
  
  // Schedule
  startDate       DateTime
  endDate         DateTime
  totalWeeks      Int
  daysOfWeek      Int[]    // [0,3] = Sunday and Wednesday
  startTime       String
  endTime         String
  duration        Int      // Minutes per session
  
  // Pricing
  pricePerSeries  Float
  pricePerSession Float?
  depositRequired Float?
  
  // Status
  status          String   @default("SCHEDULED") // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  isActive        Boolean  @default(true)
  
  // Requirements
  minAge          Int?     // Months
  maxAge          Int?
  prerequisites   String[] // IDs of required classes
  
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  instructor      Staff           @relation(...)
  sessions        ClassSession[]
  enrollments     ClassEnrollment[]
  waitlist        ClassWaitlist[]
  
  @@index([tenantId, status, isActive])
  @@index([startDate, endDate])
}

model ClassSession {
  id              String   @id @default(uuid())
  tenantId        String   @default("dev")
  classId         String
  sessionNumber   Int      // 1, 2, 3... up to totalWeeks
  scheduledDate   DateTime
  scheduledTime   String
  duration        Int
  
  // Status
  status          String   @default("SCHEDULED") // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  actualStartTime DateTime?
  actualEndTime   DateTime?
  
  // Content
  topic           String?
  objectives      String[]
  materials       String[]
  homework        String?
  
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  class           TrainingClass      @relation(...)
  attendance      SessionAttendance[]
  
  @@index([classId, sessionNumber])
  @@index([scheduledDate, status])
}

model ClassEnrollment {
  id              String   @id @default(uuid())
  tenantId        String   @default("dev")
  classId         String
  petId           String
  customerId      String
  
  // Enrollment
  enrollmentDate  DateTime @default(now())
  status          String   @default("ENROLLED") // ENROLLED, ACTIVE, COMPLETED, DROPPED, WAITLIST
  
  // Payment
  amountPaid      Float    @default(0)
  amountDue       Float
  paymentStatus   String   @default("PENDING") // PENDING, PARTIAL, PAID, REFUNDED
  
  // Progress
  sessionsAttended Int     @default(0)
  totalSessions   Int
  completionRate  Float   @default(0)
  
  // Certificate
  certificateIssued Boolean @default(false)
  certificateDate   DateTime?
  
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  class           TrainingClass      @relation(...)
  pet             Pet                @relation(...)
  customer        Customer           @relation(...)
  attendance      SessionAttendance[]
  
  @@unique([classId, petId])
  @@index([tenantId, status])
}

model SessionAttendance {
  id              String   @id @default(uuid())
  tenantId        String   @default("dev")
  sessionId       String
  enrollmentId    String
  petId           String
  
  // Attendance
  status          String   // PRESENT, ABSENT, EXCUSED, LATE
  arrivalTime     DateTime?
  departureTime   DateTime?
  
  // Performance
  participationLevel String? // EXCELLENT, GOOD, FAIR, POOR
  behaviorRating     Int?    // 1-5
  progressNotes      String?
  
  // Homework
  homeworkCompleted  Boolean @default(false)
  homeworkNotes      String?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  session         ClassSession    @relation(...)
  enrollment      ClassEnrollment @relation(...)
  pet             Pet             @relation(...)
  
  @@unique([sessionId, enrollmentId])
  @@index([sessionId, status])
}

model ClassWaitlist {
  id              String   @id @default(uuid())
  tenantId        String   @default("dev")
  classId         String
  petId           String
  customerId      String
  position        Int
  addedDate       DateTime @default(now())
  notified        Boolean  @default(false)
  notifiedDate    DateTime?
  status          String   @default("WAITING") // WAITING, ENROLLED, EXPIRED
  
  class           TrainingClass @relation(...)
  pet             Pet           @relation(...)
  customer        Customer      @relation(...)
  
  @@unique([classId, petId])
  @@index([classId, position])
}
```

#### API Endpoints

**Class Management**
- `GET /api/training-classes` - List all classes (with filters)
- `POST /api/training-classes` - Create new class series
- `GET /api/training-classes/:id` - Get class details
- `PUT /api/training-classes/:id` - Update class
- `DELETE /api/training-classes/:id` - Cancel class
- `POST /api/training-classes/:id/duplicate` - Duplicate for next session

**Session Management**
- `GET /api/training-classes/:id/sessions` - List all sessions
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `POST /api/sessions/:id/start` - Mark session as started
- `POST /api/sessions/:id/complete` - Mark session as completed

**Enrollment Management**
- `POST /api/training-classes/:id/enroll` - Enroll pet in class
- `GET /api/enrollments/:id` - Get enrollment details
- `PUT /api/enrollments/:id/drop` - Drop from class
- `GET /api/customers/:id/enrollments` - Customer's enrollments
- `GET /api/pets/:id/enrollments` - Pet's enrollment history

**Attendance Management**
- `POST /api/sessions/:id/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance record
- `GET /api/sessions/:id/attendance` - Get session attendance
- `GET /api/enrollments/:id/attendance` - Get enrollment attendance history

**Waitlist Management**
- `POST /api/training-classes/:id/waitlist` - Add to waitlist
- `GET /api/training-classes/:id/waitlist` - Get waitlist
- `POST /api/waitlist/:id/notify` - Notify waitlist position
- `DELETE /api/waitlist/:id` - Remove from waitlist

#### Frontend Components

**Admin Interface**
- `TrainingClassManager.tsx` - List and manage all classes
- `ClassEditor.tsx` - Create/edit class details
- `ClassScheduleCalendar.tsx` - Visual calendar of all classes
- `SessionManager.tsx` - Manage individual sessions
- `EnrollmentManager.tsx` - View and manage enrollments
- `AttendanceTracker.tsx` - Mark attendance for sessions
- `ClassReports.tsx` - Attendance, completion, revenue reports

**Instructor Interface**
- `MyClasses.tsx` - Instructor's assigned classes
- `SessionView.tsx` - Today's session with roster
- `AttendanceSheet.tsx` - Quick attendance marking
- `StudentProgress.tsx` - Track individual student progress

**Customer Interface**
- `ClassCatalog.tsx` - Browse available classes
- `ClassDetails.tsx` - View class information
- `EnrollmentForm.tsx` - Enroll in class
- `MyClasses.tsx` - View enrolled classes
- `ClassProgress.tsx` - View pet's progress

---

## Integration Points

### Shared Components
- Both features use `StaffAvailability` for scheduling
- Both integrate with `Reservation` system
- Both use `Customer` and `Pet` data
- Both generate revenue via `Invoice`

### Calendar Integration
- Groomer appointments appear on main calendar
- Training classes appear on main calendar
- Color-coded by type (grooming vs training)

### Notification System
- Groomer appointment reminders
- Class session reminders
- Waitlist notifications
- Attendance confirmations

---

## Implementation Plan

### Phase 1: Database Schema (Week 1)
- [ ] Create migration for groomer-specific tables
- [ ] Create migration for training class tables
- [ ] Update Staff model with grooming fields
- [ ] Update Service model for grooming services
- [ ] Test migrations

### Phase 2: Backend APIs (Week 1-2)
- [ ] Implement groomer appointment endpoints
- [ ] Implement groomer availability endpoints
- [ ] Implement training class endpoints
- [ ] Implement enrollment endpoints
- [ ] Implement attendance endpoints
- [ ] Add validation and business logic
- [ ] Write tests

### Phase 3: Admin Frontend (Week 2-3)
- [ ] Groomer schedule calendar
- [ ] Groomer availability manager
- [ ] Training class manager
- [ ] Session manager
- [ ] Attendance tracker
- [ ] Enrollment manager

### Phase 4: Staff/Customer Frontend (Week 3-4)
- [ ] Groomer personal schedule view
- [ ] Instructor class view
- [ ] Customer groomer selection
- [ ] Customer class enrollment
- [ ] Progress tracking views

### Phase 5: Testing & Polish (Week 4)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] UI/UX refinements
- [ ] Documentation
- [ ] Training materials

---

## Success Metrics

### Groomer Scheduling
- Groomer utilization rate (appointments per day)
- Customer satisfaction with groomer assignment
- Appointment no-show rate
- Average service time accuracy

### Training Classes
- Class enrollment rate
- Class completion rate
- Attendance rate per session
- Revenue per class series
- Waitlist conversion rate

---

## Future Enhancements

### Groomer Scheduling
- Groomer commission tracking
- Customer reviews and ratings
- Automatic groomer matching based on skills
- Mobile app for groomers
- Photo upload for before/after

### Training Classes
- Video lessons and homework
- Online class registration
- Automated certificate generation
- Class packages and bundles
- Advanced progress tracking with milestones

---

**Last Updated**: October 25, 2025  
**Status**: Design Phase  
**Next Step**: Database schema implementation
