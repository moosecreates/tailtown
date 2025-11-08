# Security Quick Reference

**Security Score:** 95/100 ⭐⭐⭐⭐⭐

**Note:** All curl examples in this document use `localhost` for **local testing only**. Production uses `https://canicloud.com`

---

## ✅ What's Protected

- ✅ **Brute Force** - Rate limiting (5 attempts/15 min)
- ✅ **Account Takeover** - Auto-lockout after 5 failed logins
- ✅ **Token Theft** - Short-lived tokens (8h) with rotation
- ✅ **Injection** - Input validation on all endpoints
- ✅ **DoS** - Request size limits (10MB max)
- ✅ **XSS** - Input sanitization + security headers

---

## 🔒 How To: Add Validation

### 1. Create Schema
```typescript
// /validators/myFeature.validators.ts
import { z } from 'zod';
import { emailSchema, nameSchema } from './common.validators';

export const createUserSchema = z.object({
  email: emailSchema,
  name: nameSchema,
  age: z.number().int().min(18).max(120)
});
```

### 2. Apply to Route
```typescript
import { validateBody } from '../middleware/validation.middleware';
import { createUserSchema } from '../validators/myFeature.validators';

router.post('/users', validateBody(createUserSchema), createUser);
```

### 3. Test It
```bash
# Valid request - works
curl -X POST http://localhost:4004/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"John","age":25}'

# Invalid request - returns 400
curl -X POST http://localhost:4004/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","name":"","age":15}'
```

---

## 🔑 How To: Check Authentication

### In Controller
```typescript
export const myHandler = async (req, res, next) => {
  // User is already authenticated by middleware
  const userId = req.user.id;
  const tenantId = req.user.tenantId;
  
  // Your logic here
};
```

### In Route
```typescript
import { authenticate } from '../middleware/auth.middleware';

// Protected route
router.get('/protected', authenticate, handler);

// Public route
router.get('/public', handler);
```

---

## 🛡️ How To: Add Rate Limiting

```typescript
import { loginRateLimiter } from '../middleware/rateLimiter.middleware';

// Strict (5 attempts/15 min)
router.post('/login', loginRateLimiter, loginHandler);

// Or create custom
import rateLimit from 'express-rate-limit';

const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests
});

router.get('/api/search', customLimiter, searchHandler);
```

---

## 🔐 Common Validation Schemas

```typescript
import {
  emailSchema,        // Valid email
  passwordSchema,     // 8+ chars, upper, lower, number, special
  phoneSchema,        // Phone number
  uuidSchema,         // UUID v4
  nameSchema,         // Name (1-100 chars)
  urlSchema,          // Valid URL
  currencySchema,     // Amount in cents
} from './common.validators';
```

---

## ⚠️ Security Checklist

When adding a new endpoint:

- [ ] Input validation added
- [ ] Authentication required (if needed)
- [ ] Authorization checked (tenant isolation)
- [ ] Rate limiting applied (if sensitive)
- [ ] Tests include security scenarios
- [ ] No sensitive data in logs
- [ ] Errors don't leak information

---

## Common Issues

**"Too many requests" error:**
- Rate limit hit
- Wait 15 minutes or use different IP

**"Account locked" error:**
- 5 failed login attempts
- Wait 15 minutes for auto-unlock

**"Invalid token" error:**
- Token expired (8 hours)
- Use refresh token to get new one

**Validation error:**
- Check error.errors array for field-specific messages
- Fix input and retry

---

## 📚 More Details

- **Full Security Docs:** [/docs/ai-context/security/](../ai-context/security/)
- **Security Checklist:** [/docs/SECURITY-CHECKLIST.md](../SECURITY-CHECKLIST.md)
- **OWASP Top 10:** [/docs/ai-context/security/SECURITY-FINAL-SUMMARY.md](../ai-context/security/SECURITY-FINAL-SUMMARY.md)
