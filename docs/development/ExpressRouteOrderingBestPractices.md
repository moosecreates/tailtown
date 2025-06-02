# Express.js Route Ordering Best Practices

This document outlines best practices for organizing and ordering routes in Express.js applications to avoid common pitfalls and ensure predictable behavior.

## The Importance of Route Order

In Express.js, **routes are processed in the order they are defined**. This is a fundamental concept that can lead to unexpected behavior if not properly understood and managed.

When a request comes in, Express tries to match it against routes in the order they were added to the router. Once it finds a match, it executes that route handler and stops looking for more matches (unless the route handler calls `next()`).

## Common Pitfalls

### ❌ Parameterized Routes Catching Specific Routes

The most common issue occurs when parameterized routes (e.g., `/:id`) are defined before specific routes (e.g., `/availability`):

```javascript
// PROBLEMATIC: This will cause issues
router.get('/:id', getResourceById);           // Will catch ALL paths including '/availability'
router.get('/availability', checkAvailability); // Will NEVER be reached
```

In this example, a request to `/availability` will be handled by the `getResourceById` handler because Express interprets "availability" as the `:id` parameter.

## Best Practices

### 1. Define Specific Routes Before Parameterized Routes

Always place specific routes before routes with parameters:

```javascript
// CORRECT: Specific routes first
router.get('/availability', checkAvailability);
router.get('/health', healthCheck);

// Then parameterized routes
router.get('/:id', getResourceById);
router.get('/:id/details', getResourceDetails);
```

### 2. Group Routes Logically

Organize routes in a logical structure that makes the ordering clear:

```javascript
// 1. Static routes (no parameters)
router.get('/', getAllResources);
router.get('/health', healthCheck);
router.get('/availability', checkAvailability);
router.post('/batch', batchOperation);

// 2. Parameterized routes
router.get('/:id', getResourceById);
router.patch('/:id', updateResource);
router.delete('/:id', deleteResource);

// 3. Nested parameterized routes
router.get('/:id/details', getResourceDetails);
router.get('/:id/history', getResourceHistory);
```

### 3. Use Comments to Indicate Route Order Importance

Add clear comments to indicate the importance of route order:

```javascript
// IMPORTANT: Specific routes must come before parameterized routes
// These routes handle specific endpoints
router.get('/availability', checkAvailability);
router.post('/availability/batch', batchCheckAvailability);

// Parameterized routes must come last
router.get('/:id', getResourceById);
```

### 4. Consider Using Multiple Routers

For complex APIs, consider using multiple routers to better organize and control route matching:

```javascript
// Availability-specific router
const availabilityRouter = express.Router();
availabilityRouter.get('/', checkAvailability);
availabilityRouter.post('/batch', batchCheckAvailability);

// Resource CRUD router
const resourceCrudRouter = express.Router();
resourceCrudRouter.get('/:id', getResourceById);
resourceCrudRouter.patch('/:id', updateResource);

// Main router
router.use('/availability', availabilityRouter);
router.use('/', resourceCrudRouter);
```

### 5. Use Router Paths Effectively

When mounting routers, use the path parameter to avoid conflicts:

```javascript
// Main app
app.use('/api/v1/resources/availability', availabilityRoutes);
app.use('/api/v1/resources', resourceRoutes);
```

## Real-World Example

Here's a real-world example from our reservation service that demonstrates proper route ordering:

```javascript
// Resource routes (resourceRoutes.ts)

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Resource routes healthy' });
});

// Resource availability routes - specific routes must come before parameterized routes
router.get('/availability', checkResourceAvailability);
router.post('/availability/batch', batchCheckResourceAvailability);

// Resource CRUD routes
router.get('/', getAllResources);
router.post('/', createResource);

// Parameterized routes must come last
router.get('/:id/availability', getResourceAvailability);
router.get('/:id', getResourceById);
router.patch('/:id', updateResource);
router.delete('/:id', deleteResource);
```

## Troubleshooting Route Order Issues

If you suspect a route order issue:

1. **Check for 404 errors** when you expect a route to match
2. **Log all registered routes** at startup to verify the order
3. **Use route debugging middleware** to see which routes are being attempted
4. **Test specific routes** directly to isolate the issue

```javascript
// Debugging middleware to log route matching attempts
app.use((req, res, next) => {
  console.log(`Attempting to match route: ${req.method} ${req.path}`);
  next();
});
```

## Conclusion

Proper route ordering is essential for predictable behavior in Express.js applications. By following these best practices, you can avoid common pitfalls and ensure your API routes work as expected.

Remember the golden rule: **specific routes before parameterized routes**.
