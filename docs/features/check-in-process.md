# Check-In Process Feature Specification

## Overview

Comprehensive check-in system for boarding reservations with customizable questionnaires, service agreements, and e-signatures.

**Priority**: Critical  
**Target**: November 22, 2025  
**Effort**: 2-3 weeks

---

## Business Requirements

### Core Functionality

1. **Customizable Check-In Questions**
   - Multi-tenant support (different questions per account)
   - Question types: text, number, yes/no, multiple choice, time, notes
   - Ability to add/remove/reorder questions
   - Required vs optional questions
   - Default question templates

2. **Standard Question Categories**
   - **Contact Information**
     - Reachability during stay
     - Time zone differences
     - Emergency contact verification
   
   - **Feeding Schedule**
     - Meal times (morning, lunch, evening)
     - Portion amounts
     - Food toppers/supplements
     - Permission for appetite incentives (cheese, etc.)
     - Permission for probiotics if upset stomach
   
   - **Medication Tracking**
     - Medication name
     - Dosage amount
     - Frequency (how often)
     - Administration method (oral pill, liquid, topical, injection, eye drops, ear drops, inhaler, patch, other)
     - Time of day for administration
     - With/without food
     - Special instructions
     - Start and end dates
     - Prescribing veterinarian
     - Additional notes
   
   - **Belongings Tracking**
     - Item descriptions (collars, toys, bedding, etc.)
     - Quantity tracking
     - Return verification at checkout

3. **Service Agreement**
   - Customizable agreement text per tenant
   - Multiple initial points throughout document
   - Final signature requirement
   - Digital signature capture
   - Timestamp and user tracking
   - PDF generation for records

4. **Check-In Summary**
   - Printable summary for staff
   - Quick reference card for kennel
   - Digital record in system

---

## Technical Design

### Database Schema

#### CheckInTemplate (Multi-tenant)
```prisma
model CheckInTemplate {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  description String?
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  
  sections    CheckInSection[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, name])
  @@index([tenantId, isActive])
}

model CheckInSection {
  id          String   @id @default(uuid())
  templateId  String
  template    CheckInTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  order       Int
  
  questions   CheckInQuestion[]
  
  @@index([templateId, order])
}

model CheckInQuestion {
  id          String   @id @default(uuid())
  sectionId   String
  section     CheckInSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  questionText String
  questionType QuestionType
  options     Json?    // For multiple choice questions
  isRequired  Boolean  @default(false)
  order       Int
  placeholder String?
  helpText    String?
  
  @@index([sectionId, order])
}

enum QuestionType {
  TEXT
  NUMBER
  YES_NO
  MULTIPLE_CHOICE
  TIME
  LONG_TEXT
  DATE
}
```

#### CheckIn (Actual check-in records)
```prisma
model CheckIn {
  id              String   @id @default(uuid())
  tenantId        String
  reservationId   String   @unique
  reservation     Reservation @relation(fields: [reservationId], references: [id])
  petId           String
  pet             Pet @relation(fields: [petId], references: [id])
  customerId      String
  customer        Customer @relation(fields: [customerId], references: [id])
  
  templateId      String
  template        CheckInTemplate @relation(fields: [templateId], references: [id])
  
  responses       CheckInResponse[]
  belongings      CheckInBelonging[]
  agreement       ServiceAgreement?
  
  checkedInBy     String   // Staff member ID
  checkedInAt     DateTime @default(now())
  
  notes           String?
  
  @@index([tenantId, reservationId])
  @@index([petId])
}

model CheckInResponse {
  id          String   @id @default(uuid())
  checkInId   String
  checkIn     CheckIn @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  questionId  String
  question    CheckInQuestion @relation(fields: [questionId], references: [id])
  
  response    Json     // Flexible storage for different answer types
  
  @@index([checkInId])
}

model CheckInBelonging {
  id          String   @id @default(uuid())
  checkInId   String
  checkIn     CheckIn @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  
  itemType    String   // collar, toy, bedding, food, etc.
  description String
  quantity    Int      @default(1)
  color       String?
  brand       String?
  notes       String?
  
  returnedAt  DateTime?
  returnedBy  String?
  
  @@index([checkInId])
}

model CheckInMedication {
  id                   String           @id @default(uuid())
  checkInId            String
  checkIn              CheckIn @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  
  medicationName       String
  dosage               String
  frequency            String           // e.g., "Twice daily", "Every 8 hours", "As needed"
  administrationMethod MedicationMethod // ORAL_PILL, ORAL_LIQUID, TOPICAL, INJECTION, etc.
  timeOfDay            String?          // e.g., "8:00 AM, 8:00 PM"
  withFood             Boolean          @default(false)
  specialInstructions  String?
  startDate            DateTime?
  endDate              DateTime?
  prescribingVet       String?
  notes                String?
  
  @@index([checkInId])
}

enum MedicationMethod {
  ORAL_PILL
  ORAL_LIQUID
  TOPICAL
  INJECTION
  EYE_DROPS
  EAR_DROPS
  INHALER
  TRANSDERMAL_PATCH
  OTHER
}

model ServiceAgreement {
  id              String   @id @default(uuid())
  tenantId        String
  checkInId       String   @unique
  checkIn         CheckIn @relation(fields: [checkInId], references: [id], onDelete: Cascade)
  
  agreementText   String   // Full agreement text
  initials        Json     // Array of {section: string, initials: string, timestamp: DateTime}
  signature       String   // Base64 encoded signature image
  signedBy        String   // Customer name
  signedAt        DateTime
  ipAddress       String?
  
  @@index([tenantId])
}

model ServiceAgreementTemplate {
  id          String   @id @default(uuid())
  tenantId    String
  name        String
  content     String   // Rich text content with {{INITIAL}} markers
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([tenantId, name])
  @@index([tenantId, isActive])
}
```

---

## User Interface Design

### 1. Admin: Check-In Template Management

**Location**: `/admin/check-in-templates`

**Features**:
- List all templates
- Create/edit/delete templates
- Drag-and-drop question reordering
- Question type selector
- Preview mode
- Set default template
- Clone template functionality

### 2. Admin: Service Agreement Management

**Location**: `/admin/service-agreements`

**Features**:
- Rich text editor for agreement content
- Insert initial markers
- Preview with signature areas
- Version history
- Set active agreement

### 3. Staff: Check-In Workflow

**Location**: `/check-in/:reservationId`

**Workflow Steps**:

1. **Reservation Lookup**
   - Search by customer name, pet name, or reservation ID
   - Display upcoming check-ins for today
   - Verify reservation details

2. **Check-In Questionnaire**
   - Dynamic form based on active template
   - Section-by-section navigation
   - Progress indicator
   - Auto-save draft responses
   - Validation for required fields

3. **Medication Entry**
   - Add each medication separately
   - Form fields for each medication:
     - Medication name
     - Dosage (e.g., "10mg", "1 tablet", "2 drops")
     - Frequency (e.g., "Twice daily", "Every 8 hours")
     - Administration method dropdown
     - Time(s) of day
     - Give with food? (checkbox)
     - Special instructions
     - Start/end dates (optional)
     - Prescribing vet (optional)
   - Medication list summary
   - Print medication schedule for kennel

4. **Belongings Inventory**
   - Quick-add common items (collar, leash, toy, bedding)
   - Custom item entry
   - Photo upload option
   - Print inventory label

5. **Service Agreement**
   - Display agreement text
   - Initial collection at marked sections
   - Digital signature capture (canvas)
   - Customer name confirmation
   - Email copy to customer

6. **Check-In Summary**
   - Review all responses
   - Print kennel card with key info
   - Print full check-in report
   - Complete check-in

---

## Default Question Template

### Section 1: Contact & Availability
1. Will you be reachable during your pet's stay? (Yes/No)
2. Best phone number to reach you: (Text)
3. Are you traveling to a different time zone? (Yes/No)
4. If yes, what time zone? (Text)
5. Emergency contact name: (Text)
6. Emergency contact phone: (Text)
7. Emergency contact relationship: (Text)

### Section 2: Feeding Schedule
1. When is your pet typically fed? (Multiple choice: Morning only, Morning & Evening, Morning/Lunch/Evening)
2. Morning feeding time: (Time)
3. Evening feeding time: (Time)
4. Lunch feeding time (if applicable): (Time)
5. How much food per meal? (Text with unit)
6. Any food toppers or supplements? (Long text)
7. May we add toppers (cheese, broth) if pet isn't eating? (Yes/No)
8. May we give probiotics if upset stomach occurs? (Yes/No)

### Section 3: Medical & Behavior
1. Any medications during stay? (Yes/No)
2. If yes, please describe: (Long text)
3. Any behavioral concerns we should know about? (Long text)
4. Any medical conditions we should monitor? (Long text)

### Section 4: Additional Notes
1. Special instructions or requests: (Long text)

---

## Implementation Phases

### Phase 1: Database & Backend (Week 1)
- [ ] Create Prisma schema
- [ ] Generate migrations
- [ ] Create backend API endpoints
  - Template CRUD
  - Check-in CRUD
  - Agreement CRUD
- [ ] Add validation
- [ ] Create seed data with default template

### Phase 2: Admin UI (Week 1-2)
- [ ] Template management page
- [ ] Question builder component
- [ ] Drag-and-drop reordering
- [ ] Agreement editor
- [ ] Preview functionality

### Phase 3: Check-In Workflow (Week 2-3)
- [ ] Reservation lookup
- [ ] Dynamic form renderer
- [ ] Belongings tracker
- [ ] Signature capture component
- [ ] Summary and printing
- [ ] Integration with reservation system

### Phase 4: Testing & Polish (Week 3)
- [ ] End-to-end testing
- [ ] Print layout optimization
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Documentation

---

## Success Metrics

- ✅ Check-in time reduced from 15-20 minutes to 8-10 minutes
- ✅ 100% digital record keeping (no paper forms)
- ✅ Zero missed questions or information
- ✅ Customer satisfaction with digital signature
- ✅ Staff can customize questions without developer help

---

## Future Enhancements

- Mobile app for customer pre-check-in
- QR code check-in
- Photo upload for pet identification
- Vaccination record integration
- Automatic reminder emails before arrival
- Check-out process with belongings verification
