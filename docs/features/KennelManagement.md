# Kennel Management System

## Overview

The Kennel Management System allows staff to track and manage the 168 numbered kennels in the facility. The system helps ensure that each pet is assigned to a specific kennel during check-in, making it easy to locate pets when owners come to pick them up.

## Features

### 1. Suite Categorization
- **Standard Suite**: Basic accommodation for pets (142 kennels)
- **Standard Plus Suite**: Enhanced accommodation with additional features (25 kennels)
- **VIP Suite**: Premium accommodation with special amenities (1 kennel)

### 2. Kennel Board
- Visual grid representation of all kennels
- Color-coded by suite type and occupancy status
- Quick filtering by suite type, status, or search term
- Detailed information on hover and click

### 3. Status Tracking
- **Available**: Ready for assignment
- **Occupied**: Currently has a pet assigned
- **Maintenance**: Not available due to cleaning or repair
- **Reserved**: Pre-assigned for an upcoming reservation

### 4. Cleaning Management
- Track when kennels were last cleaned
- Mark kennels as cleaned after turnover
- Schedule maintenance for kennels requiring attention

## Technical Implementation

The system leverages the existing Resource model with the following design decisions:

1. **Data Structure**:
   - Use `LUXURY_SUITE` resource type
   - Store suite-specific data in the attributes JSON field:
     - `suiteType`: STANDARD, STANDARD_PLUS, or VIP
     - `suiteNumber`: Numeric identifier (1-168)
     - `lastCleaned`: Timestamp of last cleaning
     - `maintenanceStatus`: Current status of the kennel

2. **Integration with Reservation System**:
   - When a reservation is confirmed, staff can assign a specific kennel
   - Upon check-in, kennel status changes to "Occupied"
   - Upon check-out, kennel is marked for cleaning
   - Status is determined based on active reservations for the selected date

3. **UI Components**:
   - SuiteBoard: Main kennel visualization grid
   - Suite detail dialog: Shows occupancy and maintenance details
   - Suite stats: Quick metrics on availability and occupancy

4. **Status Determination Logic**:
   - Suite status is determined on the frontend based on:
     - Maintenance status (highest priority)
     - Active reservations (CONFIRMED or CHECKED_IN status)
     - Default to AVAILABLE when no maintenance or reservations
   - Date filtering ensures only relevant reservations affect status

## Best Practices

1. **Assignment Guidelines**:
   - Assign kennels based on pet size and temperament
   - Keep similar-sized pets in the same area when possible
   - Reserve the VIP suite for pets requiring special care or premium service

2. **Cleaning Protocol**:
   - Clean kennels immediately after check-out
   - Perform deep cleaning weekly
   - Mark kennels for maintenance when repairs are needed

3. **Privacy and Security**:
   - Staff must verify ownership before providing kennel location information
   - Access to kennel management is restricted to authorized staff only

## Recent Improvements

1. **Consistent Status Display**:
   - Fixed status discrepancies between kennel board and suite details
   - Implemented client-side status determination for better consistency
   - Improved date handling to ensure correct status based on selected date

2. **Code Optimization**:
   - Created centralized date utility functions for consistent date formatting
   - Reduced redundant code and improved maintainability
   - Enhanced error handling for better user experience
   - Improved logging for easier troubleshooting

## Future Enhancements

1. QR codes on kennels for quick status updates
2. Automated cleaning schedule notifications
3. Enhanced reporting on kennel utilization
4. Mobile app access for staff on the facility floor
5. Automated status synchronization between frontend and backend
6. Improved caching for better performance
