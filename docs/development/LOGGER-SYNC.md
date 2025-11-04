# Logger Synchronization

## Overview

The logger utility (`logger.ts`) is duplicated across multiple services to avoid TypeScript compilation issues with shared code outside service directories.

## Duplicated Files

- `services/customer/src/utils/logger.ts`
- `services/reservation-service/src/utils/logger.ts`
- `frontend/src/utils/logger.ts` (browser-optimized version)

## Important

⚠️ **These files must remain synchronized!**

The backend logger files (customer and reservation services) should be identical. The frontend logger is slightly different due to browser-specific features (color console output).

## Verification

Run the sync check script before committing:

```bash
./scripts/check-logger-sync.sh
```

This script will:
- Compare the two backend logger files
- Report any differences
- Exit with error code if files don't match

## Making Changes

When updating the logger utility:

1. **Update one file** (e.g., `services/customer/src/utils/logger.ts`)
2. **Copy to other service**:
   ```bash
   cp services/customer/src/utils/logger.ts services/reservation-service/src/utils/logger.ts
   ```
3. **Verify synchronization**:
   ```bash
   ./scripts/check-logger-sync.sh
   ```
4. **Commit both files together**

## Why Not Use a Shared Package?

We considered several approaches:

### Option 1: Shared folder (❌ Rejected)
- TypeScript `rootDir` restrictions prevent importing from outside service directories
- Would require complex build configuration

### Option 2: npm workspace package (❌ Too complex)
- Requires separate package.json
- Adds build complexity
- Overkill for a single utility file

### Option 3: File duplication with sync checks (✅ Current approach)
- Simple and pragmatic
- No build complexity
- Easy to verify with script
- Works with existing TypeScript configuration

## Future Improvements

If we add more shared utilities, consider:
- Creating a proper shared package with its own tsconfig
- Using npm workspaces
- Setting up a monorepo build tool (Turborepo, Nx, etc.)

For now, the duplication approach is the most practical solution.

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Check logger synchronization
  run: ./scripts/check-logger-sync.sh
```

This ensures logger files stay synchronized across all commits.
