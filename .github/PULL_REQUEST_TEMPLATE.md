## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Best Practices Checklist
**Reference**: `/docs/DEVELOPMENT-BEST-PRACTICES.md`

### Security & Multi-Tenancy
- [ ] All database queries include `tenantId` filter
- [ ] Tenant isolation tested (no cross-tenant data access)
- [ ] No sensitive data in logs or error messages
- [ ] Input validation on all user inputs

### Authentication
- [ ] Public routes (login, etc.) don't have auth middleware
- [ ] Protected routes have appropriate auth middleware
- [ ] Token validation working correctly
- [ ] Proper error codes (401 vs 403)

### Configuration
- [ ] Environment variables documented
- [ ] No hardcoded URLs or credentials
- [ ] Production build tested (if frontend changes)
- [ ] No localhost references in production code

### Code Quality
- [ ] Follows existing code patterns
- [ ] TypeScript types are correct
- [ ] Error handling implemented
- [ ] JSDoc comments for complex functions

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] Tenant isolation tested (if database changes)
- [ ] Authentication tested (if auth changes)
- [ ] All tests passing

### Deployment
- [ ] Migrations created (if database changes)
- [ ] Environment variables added to `.env.example`
- [ ] Deployment notes added (if special steps needed)
- [ ] Verified with `npm run verify-build` (if frontend)

## Testing Done
<!-- Describe how you tested your changes -->

## Related Issues
<!-- Link to related issues -->

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Deployment Notes
<!-- Any special deployment considerations -->
