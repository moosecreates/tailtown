# Database Setup and Migration Guide

## Overview

This guide covers database setup, schema synchronization, and seeding for the Tailtown application.

---

## Database Architecture

### Shared Database Pattern

Both microservices share a single PostgreSQL database:

- **Database**: `customer` on `localhost:5433`
- **Customer Service**: Connects to `localhost:5433/customer`
- **Reservation Service**: Connects to `localhost:5433/customer`

**Why Shared Database?**
- Simplifies data consistency
- Avoids complex distributed transactions
- Easier development and testing
- Single source of truth for all data

---

## Initial Setup

### 1. Start PostgreSQL

```bash
# PostgreSQL should be running on port 5433
# Database name: customer
```

### 2. Configure Environment Variables

**Customer Service** (`services/customer/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/customer"
PORT=4004
NODE_ENV=development
```

**Reservation Service** (`services/reservation-service/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/customer"
PORT=4003
NODE_ENV=development
CUSTOMER_SERVICE_URL="http://localhost:4004/health"
```

### 3. Sync Database Schema

Both services need to push their schemas to the shared database:

```bash
# Customer Service
cd services/customer
npx prisma db push

# Reservation Service  
cd services/reservation-service
npx prisma db push
```

### 4. Seed Data

```bash
# Customer Service (customers, pets, services)
cd services/customer
npx ts-node prisma/seed.ts

# Reservation Service (check-in templates, agreement templates)
cd services/reservation-service
npx ts-node src/scripts/seed-check-in-templates.ts
```

---

## Common Issues and Solutions

### Issue: Table Does Not Exist

**Error**: `The table 'public.check_in_templates' does not exist`

**Cause**: Schema not synced to database

**Solution**:
```bash
cd services/reservation-service
npx prisma db push --skip-generate
```

### Issue: Type Already Exists

**Error**: `type "PetType" already exists`

**Cause**: Running migrations when types already exist

**Solution**: Use `db push` instead of `migrate deploy`
```bash
npx prisma db push --skip-generate
```

### Issue: Reservations Disappeared

**Error**: Dashboard and calendar show no data

**Cause**: Service pointing to wrong database

**Solution**: Check `.env` files point to `localhost:5433/customer`

### Issue: Templates Return 500 Error

**Error**: `GET /api/check-in-templates/default` returns 500

**Cause**: Templates not seeded in database

**Solution**:
```bash
cd services/reservation-service
npx ts-node src/scripts/seed-check-in-templates.ts
```

---

## Schema Synchronization

### When to Sync

Sync schemas when:
- Setting up a new environment
- After pulling schema changes
- After switching databases
- When tables are missing

### How to Sync

**Option 1: Push Schema (Recommended for Development)**
```bash
cd services/[service-name]
npx prisma db push
```

**Option 2: Run Migrations (Production)**
```bash
cd services/[service-name]
npx prisma migrate deploy
```

### Verify Schema

```bash
cd services/reservation-service
npx prisma studio --port 5556
```

---

## Seeding Data

### Check-In Templates

Creates default boarding check-in template with:
- Contact Information section (5 questions)
- Feeding Schedule section (6 questions)
- Medical & Behavioral section (4 questions)

```bash
cd services/reservation-service
npx ts-node src/scripts/seed-check-in-templates.ts
```

### Service Agreement Templates

Creates default boarding service agreement template.

```bash
# Included in check-in templates seed script above
```

### Customer Data

Seeds sample customers, pets, and services.

```bash
cd services/customer
npx ts-node prisma/seed.ts
```

---

## Database Maintenance

### Reset Database

**⚠️ Warning: This deletes all data!**

```bash
cd services/reservation-service
npx prisma migrate reset
```

### Regenerate Prisma Client

After schema changes:

```bash
cd services/[service-name]
npx prisma generate
```

### View Database

```bash
cd services/reservation-service
npx prisma studio --port 5556
```

---

## Production Considerations

### Environment Variables

Use environment-specific `.env` files:
- `.env.development`
- `.env.production`
- `.env.test`

### Migrations

In production, use migrations instead of `db push`:

```bash
# Create migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

### Backups

Regular database backups are essential:

```bash
pg_dump -h localhost -p 5433 -U postgres customer > backup.sql
```

### Connection Pooling

For production, use connection pooling:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/customer?connection_limit=10"
```

---

## Troubleshooting

### Check Database Connection

```bash
cd services/reservation-service
npx prisma db execute --stdin <<< "SELECT 1;"
```

### List All Tables

```bash
npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

### Check Tenant Data

```bash
npx prisma db execute --stdin <<< "SELECT DISTINCT \"tenantId\" FROM reservations;"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Sync schema | `npx prisma db push` |
| Seed templates | `npx ts-node src/scripts/seed-check-in-templates.ts` |
| View database | `npx prisma studio --port 5556` |
| Generate client | `npx prisma generate` |
| Reset database | `npx prisma migrate reset` |

---

## Related Documentation

- [Shared Database Pattern](../architecture/database-architecture.md)
- [Prisma Schema](../../services/reservation-service/prisma/schema.prisma)
- [Seed Scripts](../../services/reservation-service/src/scripts/)
