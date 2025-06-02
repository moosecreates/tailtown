# Data Modeling Strategy for Tailtown Refactoring

This document outlines the data modeling strategies and optimization approaches for the Tailtown SaaS refactoring project, with an emphasis on achieving both domain clarity and performance at scale.

## Core Principles

1. **Balance normalization with performance**: Design for clean domain boundaries while optimizing for common query patterns
2. **Start normalized, optimize incrementally**: Begin with proper domain separation and add performance optimizations as needed
3. **Use domain-driven design**: Align data models with business domains and bounded contexts
4. **Prepare for multi-tenancy**: Design all data structures with tenant isolation in mind

## Customer and Pet Data Strategy

### Current Structure
The system currently uses separate entities for Customer and Pet data:

```prisma
model Customer {
  id          String  @id @default(uuid())
  // Customer fields
  pets        Pet[]   // Relation to pets
}

model Pet {
  id          String   @id @default(uuid())
  customerId  String   // Foreign key
  // Pet fields
  owner       Customer @relation(fields: [customerId], references: [id])
}
```

### Analysis
- Customers and pets are frequently accessed together in the UI
- Pet records may be numerous for some customers
- Pet-specific operations need pet data but not always full customer data
- Both entities may grow to substantial size in a scaled system

### Balanced Approach

We will implement a hybrid approach:

1. **Keep the core data models separate** (Customer and Pet)
   - Maintains clean domain boundaries
   - Enables parallel scaling
   - Simplifies domain-specific operations

2. **Create optimized read models** for specific use cases
   ```prisma
   model CustomerWithPetsView {
     id            String   @id
     // Denormalized customer data
     firstName     String
     lastName      String
     // Common pet data arrays
     petIds        String[]
     petNames      String[]
     petTypes      String[]
     // Other frequently accessed data
   }
   ```

3. **Add database views for reporting queries**
   - Create materialized views for complex, frequently-accessed reports
   - Refresh these views on a schedule appropriate to the data change frequency

4. **Implement application-level caching**
   - Cache common customer+pets queries
   - Use cache invalidation strategies tied to data mutation operations

5. **Add strategic indexes**
   ```prisma
   model Pet {
     // ...existing fields
     
     @@index([customerId, isActive]) // For active pet queries
     @@index([customerId, type])     // For pet type filtering
   }
   ```

## Reservation Data Strategy

### Optimization Approach

1. **Partition by date ranges**
   - Historical reservations (> 1 year old)
   - Recent reservations (30 days - 1 year)
   - Active reservations (next 30 days)
   - Future reservations (> 30 days ahead)

2. **Create denormalized calendar view**
   - Combine reservation data with resource information
   - Pre-compute date range overlaps
   - Include customer and pet names for display

3. **Optimize for kennel occupancy queries**
   - Add specialized indexes for date range + resource queries
   - Create a materialized view for current occupancy status
   - Improve the robustness of matching reservations to kennels (fixing past issues with Standard Plus Suite reservations)

## Financial Data Strategy

1. **Separate operational from reporting data**
   - Keep transactional data normalized
   - Create aggregate reporting tables
   
2. **Implement archiving strategy**
   - Move completed transactions older than 1 year to archive tables
   - Maintain aggregated summary data in the main tables

3. **Add tenant-specific indexes**
   - Create compound indexes including tenant ID for all financial queries

## Implementation Guidelines

### Phase 1: Foundation
- Add multi-tenancy fields to all models
- Create proper indexes for existing models
- Implement efficient query patterns

### Phase 2: Read Optimization
- Create database views for common queries
- Implement caching strategy
- Add reporting-specific models

### Phase 3: Advanced Scaling
- Implement partitioning for large tables
- Add archiving strategy for historical data
- Create materialized views with refresh schedules

## Testing and Validation

For each optimization:
1. Benchmark query performance before and after changes
2. Verify data consistency across related models
3. Test with representative data volumes
4. Validate multi-tenant isolation

## Implementation Notes

This section tracks implementation decisions, lessons learned, and refinements to the strategy as the refactoring progresses.

| Date | Component | Decision | Rationale |
|------|-----------|----------|-----------|
| 2025-06-01 | Customer/Pet Data | Documented balanced approach | Initial strategy to maintain domain boundaries while optimizing for performance at scale |

## References

- [API Service Layer Documentation](./API-SERVICE-LAYER.md)
- [SaaS Scaling Assessment](./SaaS-Scaling-Assessment.md)
- [Financial Data Architecture](./financial-data-architecture.md)
