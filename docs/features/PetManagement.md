# Pet Management

## Overview
The Pet Management system allows staff to create, view, edit, and manage pets in the Tailtown application. Each pet is associated with a customer and can have various attributes like breed, color, weight, and special notes.

## Features

### Pet Details
- Basic information: name, type, breed, color, birthdate, weight, gender
- Medical information: vaccination status, microchip number, rabies tag number
- Special needs and notes: behavior notes, food notes, medication notes, allergies
- Veterinarian information: vet name, vet phone

### Pet Icons
Pet icons are visual indicators that appear on pet cards and profiles to quickly communicate important information about a pet. Examples include:
- Medical alerts
- Behavioral traits
- Special handling requirements
- Feeding instructions

**Technical Implementation:**
- Pet icons and icon notes are stored in the browser's localStorage rather than in the database
- This allows for flexible UI enhancements without requiring database schema changes
- Icons are associated with a pet using the pet's ID as a key in localStorage
- When a pet is loaded, the application checks localStorage for any associated icons

### Pet List
- View all pets with filtering and sorting options
- Quick access to pet details
- Visual indicators for active/inactive pets

### Integration with Other Features
- Pets are linked to reservations
- Pet information is displayed on the kennel calendar
- Pet details are accessible from customer profiles

## Technical Notes

### Data Storage
- Pet basic information is stored in the database
- Pet icons and icon notes are stored in the browser's localStorage
- Vaccination records are stored as JSON objects in the database
- Pet profile photos are stored in the `uploads/pets` directory on the backend server

### UI Components
- PetDetails: Form for creating and editing pet information
- PetList: Table displaying all pets with filtering options
- PetCard: Compact display of pet information used in various views

### Image Handling
- Pet profile photos are uploaded via the PetDetails form
- Images are stored on the backend server in the `uploads/pets` directory
- Frontend accesses images through the backend server on port 3002
- Image URLs are constructed as: `http://localhost:3002/uploads/pets/[filename]`
- A timestamp query parameter is added to prevent browser caching: `?t=[timestamp]`

### Port Configuration
- Backend server runs on port 3002 as specified in the environment variables
- Frontend development server runs on port 3000
- API proxy in `setupProxy.js` forwards requests from frontend to backend
- All image and API requests must use the same port (3002) for proper functionality

### Best Practices
- Always validate pet data before saving
- Use the localStorage API for storing UI-specific data like icons
- Keep pet information up-to-date, especially vaccination records
- Ensure port configurations are consistent across the application
