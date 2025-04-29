# Price Rules

## Overview

Price Rules are a flexible way to configure dynamic pricing and discounts within the Tailtown Pet Resort Management System. They allow administrators to create various discount scenarios based on different conditions such as day of the week, multi-day stays, multiple pets, seasonal promotions, and more.

As of April 2025, Price Rules have been moved to the Settings section to better organize system configuration features and improve user experience.

## Features

- **Multiple Rule Types**: Create rules based on different conditions:
  - Day of Week: Apply discounts on specific days
  - Multi-Day: Discounts for longer stays
  - Multi-Pet: Discounts when multiple pets are booked
  - Seasonal: Date-range based discounts
  - Promotional: Limited-time offers
  - Custom: Flexible rules for special cases

- **Discount Types**:
  - Percentage discounts (e.g., 10% off)
  - Fixed amount discounts (e.g., $15 off)

- **Rule Priority**: Set priority levels to determine which rules take precedence when multiple rules could apply

- **Service Targeting**: Apply rules to specific services or service categories

- **Date Range Controls**: Set start and end dates for seasonal and promotional discounts

## Accessing Price Rules

Price Rules can be accessed through the Settings page:

1. Navigate to the Settings page from the main navigation
2. Click on the "Price Rules" card
3. View, create, edit, or delete price rules

## Creating a New Price Rule

1. From the Price Rules page, click "Add Rule"
2. Fill in the required information:
   - Name: A descriptive name for the rule
   - Rule Type: Select the type of rule
   - Discount Type: Choose between percentage or fixed amount
   - Discount Value: Enter the discount amount
   - Additional fields will appear based on the selected rule type
3. Click "Create Rule" to save

## Editing an Existing Price Rule

1. From the Price Rules list, click the edit icon next to the rule you want to modify
2. Update the rule information as needed
3. Click "Update Rule" to save your changes

## Technical Implementation

Price Rules are implemented with the following components:

- Frontend: React components in the Settings section
- Backend: Express.js API with Prisma ORM
- Database: PostgreSQL with the PriceRule model

### Data Model

The PriceRule model includes:
- Basic information (name, description)
- Rule type (DAY_OF_WEEK, MULTI_DAY, etc.)
- Discount information (type, value)
- Conditional fields (minQuantity, maxQuantity, daysOfWeek, etc.)
- Date range fields (startDate, endDate)
- Priority and active status

## Best Practices

- **Rule Priority**: Assign higher priority to more specific rules
- **Testing**: After creating rules, test them with sample reservations
- **Naming**: Use clear, descriptive names that indicate the purpose of the rule
- **Documentation**: Document any complex pricing strategies for future reference
