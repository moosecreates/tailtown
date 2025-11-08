# Quick Start Guide

**Time to productivity:** < 10 minutes

---

## 🌐 For End Users (No Setup Required!)

**Just visit the production site:**
- **Tailtown (Production):** https://tailtown.canicloud.com
- **BranGro (Demo):** https://brangro.canicloud.com

No installation needed! 🎉

---

## 💻 For Developers (Local Development Setup)

### 🚀 Get Running

### 1. Clone and Install
```bash
git clone https://github.com/moosecreates/tailtown.git
cd tailtown
npm install
```

### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and set:
# - DATABASE_URL (PostgreSQL connection)
# - JWT_SECRET (any random string)
# - JWT_REFRESH_SECRET (different random string)
```

### 3. Setup Database
```bash
cd services/customer
npx prisma migrate dev
npx prisma generate
```

### 4. Start Development Server
```bash
# Terminal 1: Customer Service
cd services/customer
npm run dev

# Terminal 2: Reservation Service  
cd services/reservation-service
npm run dev

# Terminal 3: Frontend
cd frontend
npm start
```

### 5. Verify Local Development Works
- **Frontend:** http://localhost:3000
- **Customer API:** http://localhost:4004/health
- **Reservation API:** http://localhost:4003/health

**Note:** These are LOCAL development URLs. Production uses https://canicloud.com

---

## 🧪 Run Tests

```bash
# All tests
npm test

# Specific service
cd services/customer && npm test

# Security tests
cd services/customer && npm test -- --testPathPattern=security
```

---

## 🛠️ Make Your First Change

### Add a New API Endpoint

1. **Create route** in `services/customer/src/routes/`:
```typescript
router.get('/my-endpoint', myHandler);
```

2. **Create controller** in `services/customer/src/controllers/`:
```typescript
export const myHandler = async (req, res) => {
  res.json({ message: 'Hello!' });
};
```

3. **Add test** in `services/customer/src/__tests__/`:
```typescript
test('my endpoint works', async () => {
  const response = await request(app).get('/api/my-endpoint');
  expect(response.status).toBe(200);
});
```

4. **Run test**:
```bash
npm test
```

---

## 📚 Next Steps

- **Common Tasks:** [COMMON-TASKS.md](./COMMON-TASKS.md)
- **Security:** [SECURITY.md](./SECURITY.md)
- **Testing:** [TESTING.md](./TESTING.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🆘 Troubleshooting

**Database connection fails:**
```bash
# Check PostgreSQL is running
psql -h localhost -p 5432 -U postgres

# Update DATABASE_URL in .env
```

**Port already in use:**
```bash
# Find process using port
lsof -i :4004

# Kill it
kill -9 <PID>
```

**Tests failing:**
```bash
# Clear and rebuild
rm -rf node_modules
npm install
npm test
```

---

**Need more details?** See [AI Context Docs](/docs/ai-context/)
