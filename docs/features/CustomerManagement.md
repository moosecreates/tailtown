# Customer Management

## Overview
The Customer Management module provides comprehensive tools for managing pet owner information in the Tailtown Pet Resort system. It allows staff to create, view, edit, and manage customer profiles, including contact information, pets, and emergency contacts.

## Features

### 1. Customer Profile Management
- Create new customer profiles with essential contact information
- Edit existing customer details
- View customer history including reservations, payments, and services
- Track customer preferences and notes
- Manage customer status (active/inactive)

### 2. Emergency Contact Information
- **Added in May 2025**: Enhanced emergency contact collection with:
  - Primary emergency contact name and phone
  - Relationship to the customer (spouse, parent, friend, etc.)
  - Emergency contact email address
  - Special notes or instructions for emergency situations
  - Visual indicators highlighting critical emergency information

### 3. Pet Management
- Associate multiple pets with each customer
- Track pet details including breed, age, medical requirements
- View pet history and reservation patterns
- Manage vaccination records and reminders

### 4. Customer Search and Filtering
- Search customers by name, email, or phone number
- Filter customers by status, pets, or service history
- Quick access to frequent customers

### 5. Security and Privacy
- Role-based access to customer information
- Secure storage of personal and payment details
- Compliance with data protection regulations
- Customer portal accounts with controlled information access

## Technical Implementation

### Data Model
The Customer entity is implemented with the following key fields:

```typescript
// Customer data model
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Emergency contact information
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyContactRelationship?: string;
  emergencyContactEmail?: string;
  emergencyContactNotes?: string;
  
  // Additional fields
  notes?: string;
  portalEnabled?: boolean;
  preferredContact?: 'EMAIL' | 'SMS' | 'BOTH';
  vatTaxId?: string;
  referralSource?: string;
  tags?: string[];
  isActive?: boolean;
  
  // Associations
  pets?: Pet[];
}
```

### Database Schema
Customer information is stored in the `customers` table with proper indexing for efficient search. Emergency contact information is stored directly on the customer record for immediate access during emergency situations.

### UI Components
The main interface components include:
- CustomerDetails.tsx - Primary view for customer information and editing
- CustomerForm.tsx - Input form for customer data
- CustomerList.tsx - Tabular view of all customers with filtering options

### Recent Enhancement: Emergency Contact Information
In May 2025, we enhanced the emergency contact section to provide more comprehensive information for emergency situations. This implementation includes:

1. **Database Changes**:
   - Added new columns to the Customer model:
     - emergencyContactRelationship
     - emergencyContactEmail
     - emergencyContactNotes

2. **UI Enhancements**:
   - Created a dedicated Emergency Contact section with visual distinction
   - Added relationship field to clarify the connection to the customer
   - Included email contact as an alternative communication method
   - Added notes field for special instructions
   - Implemented visual cues (red icons) to highlight emergency information

3. **Migration**:
   - Applied database migration `20250518014022_add_emergency_contact_fields`
   - Updated TypeScript interfaces to support new fields
   - Maintained backward compatibility with existing records

## Usage

### Creating a New Customer
1. Navigate to Customers section from the main navigation
2. Click "New Customer" button
3. Fill in required fields (name, email, phone)
4. Complete emergency contact information
5. Save the customer record

### Editing Emergency Contact Information
1. Navigate to the customer's detail page
2. Click "Edit Customer" button
3. Scroll to the Emergency Contact Information section
4. Update the relevant fields
5. Click "Save" to store changes

## Future Enhancements
- Support for multiple emergency contacts per customer
- Automated emergency contact verification
- Emergency notification system integration
- Customizable emergency protocols by customer
