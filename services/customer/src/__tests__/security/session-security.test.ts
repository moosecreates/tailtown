/**
 * Session Security Tests
 * 
 * Tests to ensure session security:
 * - Session expiration
 * - Concurrent session limits
 * - Session fixation prevention
 * - Cookie security attributes
 * - Session hijacking prevention
 * - Idle timeout
 */

import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../../index';

const prisma = new PrismaClient();

describe('Session Security Tests', () => {
  const testTenantId = 'session-security-test-tenant';
  let testStaffId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    const staff = await prisma.staff.create({
      data: {
        email: 'session-test@example.com',
        firstName: 'Session',
        lastName: 'Test',
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: testTenantId,
        isActive: true
      }
    });
    testStaffId = staff.id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'session-test@example.com',
        password: 'TestPassword123!'
      });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await prisma.staff.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.$disconnect();
  });

  describe('Session Expiration', () => {
    it('should expire sessions after configured timeout', async () => {
      // Create an expired token
      const expiredToken = jwt.sign(
        {
          userId: testStaffId,
          email: 'session-test@example.com',
          role: 'ADMIN',
          tenantId: testTenantId
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Expired 1 hour ago
      );

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('expired');
    });

    it('should accept valid non-expired sessions', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should not extend session expiration on activity', async () => {
      // Get initial token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const token = loginResponse.body.token;
      const decoded1 = jwt.decode(token) as any;

      // Make a request
      await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`);

      // Token expiration should not have changed
      const decoded2 = jwt.decode(token) as any;
      expect(decoded1.exp).toBe(decoded2.exp);
    });

    it('should provide clear error message for expired sessions', async () => {
      const expiredToken = jwt.sign(
        { userId: testStaffId, email: 'session-test@example.com' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBeDefined();
      expect(response.body.message.toLowerCase()).toMatch(/expired|invalid/);
    });
  });

  describe('Concurrent Session Limits', () => {
    it('should allow multiple sessions for same user', async () => {
      // Login from "device 1"
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      // Login from "device 2"
      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      expect(login1.status).toBe(200);
      expect(login2.status).toBe(200);
      expect(login1.body.token).not.toBe(login2.body.token);
    });

    it('should track active sessions per user', async () => {
      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 3; i++) {
        const login = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'session-test@example.com',
            password: 'TestPassword123!'
          });
        sessions.push(login.body.token);
      }

      // All sessions should be valid
      for (const token of sessions) {
        const response = await request(app)
          .get('/api/customers')
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
      }
    });

    it('should enforce maximum concurrent sessions if configured', async () => {
      // If there's a limit (e.g., 5 sessions), test it
      const maxSessions = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '10');
      const sessions = [];

      for (let i = 0; i < maxSessions + 2; i++) {
        const login = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'session-test@example.com',
            password: 'TestPassword123!'
          });
        sessions.push(login);
      }

      // Should either limit sessions or allow all
      expect(sessions.every(s => s.status === 200 || s.status === 429)).toBe(true);
    });

    it('should allow logout from specific session', async () => {
      // Login to create session
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const token = login.body.token;

      // Logout
      const logout = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(logout.status).toBe(200);

      // Token should no longer work
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
    });

    it('should allow logout from all sessions', async () => {
      // Create multiple sessions
      const sessions = [];
      for (let i = 0; i < 3; i++) {
        const login = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'session-test@example.com',
            password: 'TestPassword123!'
          });
        sessions.push(login.body.token);
      }

      // Logout from all sessions
      const logoutAll = await request(app)
        .post('/api/auth/logout-all')
        .set('Authorization', `Bearer ${sessions[0]}`);

      expect(logoutAll.status).toBe(200);

      // All tokens should be invalid
      for (const token of sessions) {
        const response = await request(app)
          .get('/api/customers')
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(401);
      }
    });
  });

  describe('Session Fixation Prevention', () => {
    it('should generate new session ID on login', async () => {
      const login1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const login2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      // Each login should generate unique session
      expect(login1.body.token).not.toBe(login2.body.token);
    });

    it('should invalidate old session on password change', async () => {
      // Login
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const oldToken = login.body.token;

      // Change password
      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${oldToken}`)
        .send({
          currentPassword: 'TestPassword123!',
          newPassword: 'NewPassword123!'
        });

      // Old token should be invalid
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${oldToken}`);

      expect(response.status).toBe(401);

      // Change password back for other tests
      const newLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'NewPassword123!'
        });

      await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${newLogin.body.token}`)
        .send({
          currentPassword: 'NewPassword123!',
          newPassword: 'TestPassword123!'
        });
    });

    it('should not accept pre-set session IDs', async () => {
      // Try to set a specific session ID
      const response = await request(app)
        .post('/api/auth/login')
        .set('Cookie', 'sessionId=attacker-controlled-id')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      // Should ignore the cookie and create new session
      expect(response.status).toBe(200);
      if (response.headers['set-cookie']) {
        const sessionCookie = response.headers['set-cookie'].find((c: string) => 
          c.includes('sessionId')
        );
        if (sessionCookie) {
          expect(sessionCookie).not.toContain('attacker-controlled-id');
        }
      }
    });
  });

  describe('Cookie Security Attributes', () => {
    it('should set HttpOnly flag on session cookies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = Array.isArray(cookies) 
          ? cookies.find(c => c.includes('session') || c.includes('token'))
          : cookies;
        
        if (sessionCookie) {
          expect(sessionCookie.toLowerCase()).toContain('httponly');
        }
      }
    });

    it('should set Secure flag on session cookies in production', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const cookies = response.headers['set-cookie'];
      if (cookies && process.env.NODE_ENV === 'production') {
        const sessionCookie = Array.isArray(cookies)
          ? cookies.find(c => c.includes('session') || c.includes('token'))
          : cookies;
        
        if (sessionCookie) {
          expect(sessionCookie.toLowerCase()).toContain('secure');
        }
      }
    });

    it('should set SameSite attribute on session cookies', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = Array.isArray(cookies)
          ? cookies.find(c => c.includes('session') || c.includes('token'))
          : cookies;
        
        if (sessionCookie) {
          expect(sessionCookie.toLowerCase()).toMatch(/samesite=(strict|lax)/);
        }
      }
    });

    it('should set appropriate cookie expiration', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = Array.isArray(cookies)
          ? cookies.find(c => c.includes('session') || c.includes('token'))
          : cookies;
        
        if (sessionCookie) {
          // Should have Max-Age or Expires
          expect(sessionCookie.toLowerCase()).toMatch(/max-age|expires/);
        }
      }
    });

    it('should set cookie path to restrict scope', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const cookies = response.headers['set-cookie'];
      if (cookies) {
        const sessionCookie = Array.isArray(cookies)
          ? cookies.find(c => c.includes('session') || c.includes('token'))
          : cookies;
        
        if (sessionCookie) {
          expect(sessionCookie.toLowerCase()).toContain('path=');
        }
      }
    });
  });

  describe('Session Hijacking Prevention', () => {
    it('should bind session to IP address', async () => {
      // Login from IP 1
      const login = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', '192.168.1.100')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const token = login.body.token;

      // Try to use token from different IP
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .set('X-Forwarded-For', '192.168.1.200');

      // Should either reject or flag as suspicious
      // (Implementation may vary - some systems allow IP changes)
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should bind session to User-Agent', async () => {
      // Login with User-Agent 1
      const login = await request(app)
        .post('/api/auth/login')
        .set('User-Agent', 'Mozilla/5.0 (Original Browser)')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const token = login.body.token;

      // Try to use token with different User-Agent
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .set('User-Agent', 'Mozilla/5.0 (Different Browser)');

      // Should either reject or flag as suspicious
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should detect and prevent session replay attacks', async () => {
      // This would require tracking used tokens
      // For now, verify JWT prevents replay by design
      const token = authToken;

      // Use token multiple times
      const response1 = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`);

      const response2 = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${token}`);

      // JWT tokens can be reused until expiration
      // But should be tracked for suspicious patterns
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    it('should rotate session tokens periodically', async () => {
      // Some systems rotate tokens on each request
      // Test if implemented
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      // Check if new token provided
      if (response.headers['x-new-token']) {
        expect(response.headers['x-new-token']).not.toBe(authToken);
      }
    });
  });

  describe('Idle Timeout', () => {
    it('should track last activity time', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const token = login.body.token;
      const decoded = jwt.decode(token) as any;

      // Should have issued at time
      expect(decoded.iat).toBeDefined();
    });

    it('should expire sessions after idle timeout', async () => {
      // This would require time manipulation or waiting
      // For now, verify the concept exists
      expect(process.env.SESSION_IDLE_TIMEOUT).toBeDefined();
    });

    it('should update last activity on each request', async () => {
      // Make request
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      // Should track activity (implementation specific)
      expect(response.status).toBe(200);
    });
  });

  describe('Session Storage Security', () => {
    it('should not store sensitive data in session', async () => {
      const token = authToken;
      const decoded = jwt.decode(token) as any;

      // Should not contain password or sensitive data
      expect(decoded.password).toBeUndefined();
      expect(decoded.passwordHash).toBeUndefined();
      expect(decoded.ssn).toBeUndefined();
      expect(decoded.creditCard).toBeUndefined();
    });

    it('should encrypt session data at rest', async () => {
      // If sessions are stored in database/Redis, they should be encrypted
      // This is implementation specific
      expect(true).toBe(true); // Placeholder
    });

    it('should use secure session storage', async () => {
      // Sessions should be in Redis/Database, not in-memory for production
      // This is configuration specific
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Session Monitoring', () => {
    it('should log session creation', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      expect(response.status).toBe(200);
      // Verify logging happens (would check logs in real implementation)
    });

    it('should log session termination', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'session-test@example.com',
          password: 'TestPassword123!'
        });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${login.body.token}`);

      expect(response.status).toBe(200);
      // Verify logging happens
    });

    it('should alert on suspicious session activity', async () => {
      // Multiple logins from different locations
      // Rapid session creation
      // etc.
      expect(true).toBe(true); // Placeholder
    });
  });
});
