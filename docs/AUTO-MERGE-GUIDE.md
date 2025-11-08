# Auto-Merge Guide

## Overview

The Tailtown repository has automated PR merging configured to streamline the development workflow. PRs are automatically merged when certain conditions are met.

## How It Works

### Automatic Auto-Merge (No Action Required)

PRs from these branch patterns are **automatically merged** when all checks pass:

- `docs/*` - Documentation changes
- `chore/*` - Maintenance tasks (dependency updates, config changes, etc.)

**Example branches that auto-merge:**
- `docs/update-roadmap`
- `docs/senior-dev-review-roadmap`
- `chore/update-dependencies`
- `chore/fix-eslint-config`

### Manual Auto-Merge (Label Required)

For other branches (features, fixes, etc.), you can enable auto-merge by:

1. Adding the `automerge` label to your PR
2. All checks must pass
3. PR will automatically merge

### Preventing Auto-Merge

To prevent a PR from auto-merging (even if it matches the patterns above):

1. Add the `do-not-merge` label
2. Or mark the PR as a **Draft**

## Workflow Triggers

The auto-merge workflow runs when:

- PR is opened
- PR is updated (new commits pushed)
- PR is labeled
- PR review is submitted
- Check suite completes

## Merge Settings

- **Method**: Squash merge (all commits squashed into one)
- **Commit Message**: Uses PR title
- **Branch Deletion**: Automatically deletes branch after merge
- **Retries**: 6 attempts with 10-second delays
- **Required Approvals**: 0 (for docs/chore branches)

## Examples

### Example 1: Documentation Update (Auto)

```bash
# Create branch
git checkout -b docs/update-api-docs

# Make changes
git add docs/api/
git commit -m "docs: update API documentation"

# Push
git push origin docs/update-api-docs

# Create PR (via GitHub UI or gh CLI)
gh pr create --title "docs: update API documentation" --body "Updated API docs"

# ✅ PR will automatically merge when checks pass (no action needed!)
```

### Example 2: Feature Branch (Manual Label)

```bash
# Create branch
git checkout -b feature/new-widget

# Make changes
git add src/
git commit -m "feat: add new widget"

# Push
git push origin feature/new-widget

# Create PR
gh pr create --title "feat: add new widget" --body "Adds new widget component"

# Add automerge label
gh pr edit --add-label automerge

# ✅ PR will automatically merge when checks pass
```

### Example 3: Prevent Auto-Merge

```bash
# For a docs branch that you DON'T want to auto-merge yet
git checkout -b docs/draft-architecture

# Create PR as draft
gh pr create --draft --title "docs: draft architecture" --body "WIP"

# ✅ Won't auto-merge because it's a draft

# Or add do-not-merge label
gh pr edit --add-label do-not-merge

# ✅ Won't auto-merge even when checks pass
```

## Branch Naming Conventions

To take advantage of auto-merge, use these prefixes:

- `docs/*` - Documentation changes
- `chore/*` - Maintenance and tooling
- `feat/*` - New features (requires `automerge` label)
- `fix/*` - Bug fixes (requires `automerge` label)
- `refactor/*` - Code refactoring (requires `automerge` label)
- `test/*` - Test additions/changes (requires `automerge` label)

## Troubleshooting

### PR Not Auto-Merging

Check:
1. ✅ All checks are passing
2. ✅ PR is not a draft
3. ✅ No `do-not-merge` label
4. ✅ Branch name matches pattern (docs/* or chore/*) OR has `automerge` label
5. ✅ No merge conflicts

### Force Manual Merge

If auto-merge isn't working and you need to merge manually:

```bash
# Via GitHub UI: Click "Merge pull request"

# Or via CLI:
gh pr merge <PR_NUMBER> --squash --delete-branch
```

## Benefits

- **Faster Merges**: No waiting for manual approval on docs/chore changes
- **Consistent Process**: All PRs merged the same way (squash)
- **Clean History**: Branches automatically deleted
- **Less Context Switching**: Focus on coding, not clicking merge buttons
- **Safe**: Still requires all checks to pass

## Configuration

The auto-merge workflow is defined in:
- `.github/workflows/auto-merge.yml`

To modify the behavior, edit that file and adjust:
- Branch patterns in the `if` condition
- Merge method (`MERGE_METHOD`)
- Required approvals (`MERGE_REQUIRED_APPROVALS`)
- Other settings

## Security Notes

- Auto-merge only works for branches in the same repository
- External contributors' PRs will NOT auto-merge
- Protected branch rules still apply
- Required status checks must pass

---

**Last Updated**: November 8, 2025
