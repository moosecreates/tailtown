# Navigation Structure

## Overview
The Tailtown Pet Resort Management System uses a left sidebar navigation menu for core functionality and a top-right user menu for account-related actions. This document outlines the current navigation structure and explains how various sections are organized.

## Main Navigation Menu

### Dashboard
- **Path**: `/dashboard`
- **Description**: Overview of daily operations, including today's reservations, recent activity, and key metrics

### Calendar Items (Direct Access)
- **Boarding Calendar**
  - **Path**: `/calendar`
  - **Description**: Calendar view for boarding and daycare reservations
  - **Icon**: DaycareIcon

- **Grooming Calendar**
  - **Path**: `/calendar/grooming`
  - **Description**: Calendar view for grooming appointments
  - **Icon**: GroomingIcon

- **Training Calendar**
  - **Path**: `/calendar/training`
  - **Description**: Calendar view for training sessions
  - **Icon**: TrainingIcon

### Customers
- **Path**: `/customers`
- **Description**: Customer management, search, and profile access
- **Linked Pages**:
  - Customer Details: `/customers/:id`

### Pets
- **Path**: `/pets`
- **Description**: Pet management, search, and profile access
- **Linked Pages**:
  - Pet Details: `/pets/:id`

### Kennels (formerly Suites)
- **Path**: `/suites`
- **Description**: Visual grid representation of kennel occupancy
- **Submenu**:
  - Kennel Board: `/suites`
  - Print Kennel Cards: `/kennels/print-cards`

### Reservations
- **Path**: `/reservations`
- **Description**: List of all reservations with filtering and search
- **Linked Pages**:
  - Reservation Details: `/reservations/:id`
  - Edit Reservation: `/reservations/:id/edit`



### Admin/Settings
- **Path**: `/settings`
- **Description**: Centralized location for all administrative functions
- **Sections**:
  - Financial Dashboard: Analytics for revenue and financial metrics
  - Customer Value Analytics: Reporting on customer spending patterns
  - Staff Scheduling: Manage staff schedules and time off
  - Price Rules: Configure pricing and discount rules
  - Services: Manage service offerings and configurations
  - Resources: Configure facility resources
  - General Settings: System-wide preferences
  - System Information: Technical details about the application

## Hidden/Direct URL Routes

Some functionality is accessible by direct URL but doesn't appear in the main navigation:

### Order Entry System
- **Path**: `/orders/new`
- **Description**: Legacy step-by-step order creation process (replaced by calendar-based workflow)
- **Documentation**: See [Order Entry Documentation](../features/OrderEntry.md)

### Checkout
- **Path**: `/checkout`
- **Description**: Finalizes orders created through the calendar or reservation system

## User Menu (Top-Right)
- **Profile**: Access to user profile settings
- **Logout**: End the current session

## Navigation History

### May 2025 Updates
- Analytics functionality moved from main navigation to Admin/Settings page
- Staff Scheduling moved from main navigation to Admin/Settings page
- New Order button removed (functionality preserved via direct URL)
- Admin/Settings consolidated as central location for administrative functions

### Previous Updates
- Price Rules moved from main navigation to Settings page (see [Price Rules Memory](../features/PriceRules.md))

## Technical Implementation
The navigation structure is primarily defined in:
- `frontend/src/components/layouts/MainLayout.tsx` (main navigation)
- `frontend/src/App.tsx` (route definitions)
- `frontend/src/pages/settings/Settings.tsx` (Admin/Settings cards)
