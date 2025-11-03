# GitHub Actions Workflow Test

This file tests that our CI/CD pipelines are working correctly.

## Expected Workflows to Run:

1. **Test Suite** (`test.yml`)
   - Runs on push to development/main
   - Tests on Node 16.x and 18.x
   - Sets up PostgreSQL
   - Runs all tests

2. **PR Checks** (`pr-checks.yml`)
   - Runs on pull requests
   - Code quality checks
   - Quick test suite
   - Build verification

## Test Date: November 3, 2025

If you're reading this in a PR, the workflows should be running!

Check the "Checks" tab in this PR to see them in action.
