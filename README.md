# Tailtown Pet Resort Management System

A modern, full-featured management system for pet resorts, providing comprehensive tools for reservations, customer management, and pet care services.

## Features

### Customer Management
- Customer profiles with contact information
- Pet profiles with medical history, vaccination records
- Multiple pets per customer
- Document storage for forms and agreements

### Reservation System
- Interactive calendar interface
- Real-time availability checking
- Multiple service types (daycare, boarding, grooming)
- Color-coded reservation status
- Drag-and-drop scheduling

### Service Management
- Customizable service catalog
- Service duration and capacity settings
- Pricing management
- Resource allocation

### Resource Management
- Track kennels, rooms, and equipment
- Maintenance scheduling
- Occupancy tracking
- Resource conflict prevention

## Technology Stack

### Frontend
- React with TypeScript
- Material-UI for components
- FullCalendar for scheduling
- JWT authentication
- Responsive design

### Backend
- Express.js with TypeScript
- Prisma ORM
- PostgreSQL database
- RESTful API architecture
- JWT-based authentication

## Project Structure

```
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── contexts/       # React contexts
│   
└── services/
    └── customer/           # Customer service
        ├── src/
        │   ├── controllers/  # Route handlers
        │   ├── routes/       # API routes
        │   ├── middleware/   # Express middleware
        │   └── prisma/       # Database schema
```

## Development Setup

### Prerequisites
- Node.js >= 16.x
- npm >= 8.x
- PostgreSQL >= 13

### Environment Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/moosecreates/tailtown.git
   cd tailtown
   ```

2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../services/customer
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Frontend
   cp frontend/.env.example frontend/.env

   # Backend
   cp services/customer/.env.example services/customer/.env
   ```

4. Start the development servers:
   ```bash
   # Terminal 1: Backend
   cd services/customer
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm start
   ```

### Available URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002

## API Documentation

### Base URL
All API endpoints are prefixed with `/api`

### Authentication
- All routes except login require JWT authentication
- Token should be included in Authorization header:
  ```
  Authorization: Bearer <token>
  ```

### Response Format
All responses follow the format:
```json
{
  "status": "success" | "error",
  "data": <response_data>,
  "results": <number_of_items>,
  "totalPages": <total_pages>,
  "currentPage": <current_page>
}
```

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Follow the coding standards:
   - Use TypeScript
   - Follow ESLint rules
   - Keep files under 300 lines
   - Add JSDoc comments for complex functions
   - Write unit tests for new features

3. Submit a pull request

## License

Proprietary - All Rights Reserved
