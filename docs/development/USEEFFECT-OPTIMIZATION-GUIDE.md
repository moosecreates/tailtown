# useEffect Optimization Guide

## Overview

This guide documents the patterns and best practices for optimizing `useEffect` hooks in the Tailtown application to prevent unnecessary re-renders, fix React warnings, and improve performance.

**Date**: October 22, 2025  
**Status**: In Progress  
**Priority**: #6 in optimization list

---

## Common Problems

### 1. Missing Dependencies Warning

**Warning Message**:
```
React Hook useEffect has a missing dependency: 'functionName'. 
Either include it or remove the dependency array. (react-hooks/exhaustive-deps)
```

**Problem**:
```typescript
// ❌ BAD - loadData not in dependencies
useEffect(() => {
  loadData();
}, [someOtherDep]);

const loadData = async () => {
  // ... fetch data
};
```

**Solution**:
```typescript
// ✅ GOOD - Wrap in useCallback and include in deps
const loadData = useCallback(async () => {
  // ... fetch data
}, [dependencies]);

useEffect(() => {
  loadData();
}, [loadData]);
```

---

### 2. Function Recreated Every Render

**Problem**:
```typescript
// ❌ BAD - Function recreated on every render
const MyComponent = () => {
  const loadData = async () => {
    // This function is recreated every render
  };
  
  useEffect(() => {
    loadData();
  }, [loadData]); // This causes infinite loop!
};
```

**Solution**:
```typescript
// ✅ GOOD - Stable function reference
const MyComponent = () => {
  const loadData = useCallback(async () => {
    // Function only recreated when dependencies change
  }, [dep1, dep2]);
  
  useEffect(() => {
    loadData();
  }, [loadData]); // Safe - loadData is stable
};
```

---

### 3. Infinite Loop

**Problem**:
```typescript
// ❌ BAD - Causes infinite loop
useEffect(() => {
  setState(newValue); // Triggers re-render
}, [state]); // Re-runs when state changes
```

**Solution**:
```typescript
// ✅ GOOD - Only run when specific condition changes
useEffect(() => {
  if (condition) {
    setState(newValue);
  }
}, [condition]); // Only runs when condition changes

// OR use functional update
useEffect(() => {
  setState(prev => computeNewValue(prev));
}, []); // Runs once
```

---

## Optimization Patterns

### Pattern 1: Data Fetching on Mount

**Before**:
```typescript
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  const data = await api.fetch();
  setData(data);
};
```

**After**:
```typescript
const loadData = useCallback(async () => {
  const data = await api.fetch();
  setData(data);
}, []); // Empty deps if no external dependencies

useEffect(() => {
  loadData();
}, [loadData]);
```

---

### Pattern 2: Data Fetching with Filters

**Before**:
```typescript
useEffect(() => {
  loadData();
}, [filter, period]); // Missing loadData

const loadData = async () => {
  const data = await api.fetch(filter, period);
  setData(data);
};
```

**After**:
```typescript
const loadData = useCallback(async () => {
  const data = await api.fetch(filter, period);
  setData(data);
}, [filter, period]); // Include all external dependencies

useEffect(() => {
  loadData();
}, [loadData]); // loadData changes when filter/period change
```

---

### Pattern 3: Initialization (Run Once)

**Before**:
```typescript
useEffect(() => {
  initialize();
}, [isInitializing, initialized]); // Wrong dependencies

const initialize = async () => {
  // ... setup code
};
```

**After**:
```typescript
useEffect(() => {
  const initialize = async () => {
    // ... setup code
  };
  
  initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Only run once - documented with comment
```

---

### Pattern 4: Conditional Effect

**Before**:
```typescript
useEffect(() => {
  if (condition) {
    doSomething();
  }
}, [condition]); // Missing doSomething

const doSomething = () => {
  // ...
};
```

**After**:
```typescript
const doSomething = useCallback(() => {
  // ...
}, [deps]);

useEffect(() => {
  if (condition) {
    doSomething();
  }
}, [condition, doSomething]);

// OR if doSomething doesn't need to be a separate function:
useEffect(() => {
  if (condition) {
    // ... inline logic
  }
}, [condition, ...otherDeps]);
```

---

## When to Use eslint-disable

Sometimes it's appropriate to disable the exhaustive-deps warning. Always add a comment explaining why:

```typescript
// ✅ GOOD - Documented exception
useEffect(() => {
  loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filter]); // loadData is stable (useCallback below), only re-run when filter changes

const loadData = useCallback(async () => {
  // ...
}, [filter, otherDep]);
```

**Valid Reasons to Disable**:
1. Function is defined later but is stable (useCallback)
2. Intentionally want to run only on specific deps
3. Ref-based dependencies that don't need to trigger re-runs
4. Complex initialization that should only run once

**Always Include**:
- A comment explaining why
- What the stable dependencies are
- When the effect should re-run

---

## Files Fixed

### ✅ Completed

1. **useDashboardData.ts** (Dashboard hook)
   - Fixed infinite loop (hundreds of API calls → 2)
   - Wrapped loadData in useCallback
   - Added proper eslint-disable comments
   - **Impact**: Critical performance fix

2. **PrintKennelCards.tsx**
   - Wrapped loadReservations in useCallback
   - Fixed initialization useEffect to run once
   - Added reservations to filterReservations deps
   - **Impact**: No more React warnings

3. **AnalyticsDashboard.tsx**
   - Wrapped loadData in useCallback
   - Added loadData to useEffect deps
   - **Impact**: Proper dependency tracking

### 🔄 In Progress

4. **CustomerValueReport.tsx**
   - Has similar pattern to AnalyticsDashboard
   - Needs loadData wrapped in useCallback

5. **Services.tsx**
   - loadServices missing from deps

6. **Resources.tsx**
   - loadResources missing from deps
   - debouncedFilter dependency issue

### ⏳ Pending

See full list of files with useEffect in grep results.

---

## Testing Checklist

After optimizing useEffect hooks:

- [ ] No React warnings in console
- [ ] No infinite loops (check Network tab)
- [ ] Component loads correctly
- [ ] Filters/params trigger re-fetch as expected
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] All functionality works as before

---

## Performance Benefits

### Before Optimization
- ❌ React warnings in console
- ❌ Unnecessary re-renders
- ❌ Functions recreated every render
- ❌ Potential infinite loops
- ❌ Unpredictable behavior

### After Optimization
- ✅ Clean console
- ✅ Minimal re-renders
- ✅ Stable function references
- ✅ Predictable execution
- ✅ Better performance

---

## Common Mistakes to Avoid

### 1. Don't Omit Dependencies Without Reason
```typescript
// ❌ BAD
useEffect(() => {
  doSomething(value);
}, []); // value is used but not in deps!
```

### 2. Don't Create Circular Dependencies
```typescript
// ❌ BAD
const funcA = useCallback(() => {
  funcB();
}, [funcB]);

const funcB = useCallback(() => {
  funcA();
}, [funcA]); // Circular!
```

### 3. Don't Overuse useCallback
```typescript
// ❌ BAD - Unnecessary
const handleClick = useCallback(() => {
  console.log('clicked');
}, []); // Simple function, no deps, not in useEffect

// ✅ GOOD - Just use regular function
const handleClick = () => {
  console.log('clicked');
};
```

### 4. Don't Forget to Update Dependencies
```typescript
// ❌ BAD
const loadData = useCallback(async () => {
  const data = await api.fetch(filter, period);
  setData(data);
}, [filter]); // Missing period!
```

---

## Tools and Resources

### React DevTools
- **Profiler**: See which components re-render and why
- **Components**: Inspect hooks and their dependencies

### ESLint
- `eslint-plugin-react-hooks` catches most issues
- Don't ignore warnings without understanding them

### Browser DevTools
- **Network tab**: Check for duplicate API calls
- **Console**: Watch for warnings
- **Performance tab**: Profile re-renders

---

## Next Steps

1. Continue fixing files in priority order
2. Add useCallback to all data fetching functions
3. Document any complex dependency logic
4. Test thoroughly after each change
5. Update this guide with new patterns

---

## Summary

**Key Takeaways**:
1. Wrap functions used in useEffect with useCallback
2. Include all dependencies or document why not
3. Test for infinite loops and unnecessary re-renders
4. Use eslint-disable sparingly and with comments
5. Prioritize files with the most impact first

**Files Remaining**: ~40 files with useEffect hooks  
**Estimated Time**: 2-3 hours for high-priority files  
**Impact**: High - Better performance, no warnings, predictable behavior
