# Changelog

All notable changes to the Tailtown project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Veterinarian Management & Auto-Fill System with Gingr API integration
- Enhanced pet list display with customer last names for easier identification
- Compact table design with configurable page sizes (25, 50, 100, 200 pets per page)
- Automatic veterinarian population for 14,125+ customers (75% coverage)
- Bulk veterinarian association import from Gingr API data
- Documentation for calendar components in `docs/features/CalendarComponents.md`
- Analytics dashboard with service revenue breakdown and filtering options
- Customer value reporting with transaction history and service type breakdown
- Backend API endpoints for analytics data retrieval
- Time period filtering for all analytics reports (daily, monthly, yearly, custom date range)

### Fixed
- Fixed grooming and training calendar functionality by creating a specialized calendar component with proper time formatting
- Resolved `context.cmdFormatter is not a function` error in FullCalendar by using object notation for time formatting instead of string literals
- Improved service deletion handling to automatically deactivate services with active reservations
- Fixed UI issues when attempting to delete services with historical data
- Simplified service management UI by removing redundant deactivation controls

## [0.1.0] - 2025-04-29

### Added
- Initial version of Tailtown pet care management system
- Boarding and daycare calendar with grid view
- Grooming and training calendar views
- Reservation management system
- Customer and pet profiles
- Invoice generation and management
- Order entry system
