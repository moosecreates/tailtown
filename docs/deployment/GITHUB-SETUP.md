# GitHub Setup Guide

Complete setup for CI/CD and branch protection.

## 1. Configure GitHub Secrets

### Add DEPLOY_SSH_KEY

1. **Get your SSH key**:
   ```bash
   cat ~/ttkey
   ```

2. **Copy the entire private key** (including `-----BEGIN` and `-----END` lines)

3. **Add to GitHub**:
   - Go to https://github.com/moosecreates/tailtown/settings/secrets/actions
   - Click "New repository secret"
   - Name: `DEPLOY_SSH_KEY`
   - Value: Paste your private key
   - Click "Add secret"

### Verify Secret
- You should see `DEPLOY_SSH_KEY` in the list
- The value will be hidden (shows as `***`)

---

## 2. Enable Branch Protection

### Protect Main Branch

1. **Go to Settings**:
   - https://github.com/moosecreates/tailtown/settings/branches

2. **Add Rule**:
   - Click "Add rule"
   - Branch name pattern: `main`

3. **Configure Protection**:
   
   ✅ **Require a pull request before merging**
   - Require approvals: 1
   - Dismiss stale reviews when new commits are pushed
   
   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date
   - Select these status checks:
     - `Code Quality Checks`
     - `Quick Test Suite`
     - `Build Verification`
   
   ✅ **Require conversation resolution before merging**
   
   ✅ **Do not allow bypassing the above settings**

4. **Click "Create"**

### Protect Development Branch (Optional)

Repeat for `development` branch with same settings.

---

## 3. Enable GitHub Actions

1. **Go to Settings → Actions → General**:
   - https://github.com/moosecreates/tailtown/settings/actions

2. **Actions permissions**:
   - Select "Allow all actions and reusable workflows"

3. **Workflow permissions**:
   - Select "Read and write permissions"
   - ✅ Allow GitHub Actions to create and approve pull requests

4. **Click "Save"**

---

## 4. Test CI/CD

### Test Workflows

1. **Make a small change**:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: Trigger CI/CD"
   git push origin development
   ```

2. **Check Actions tab**:
   - Go to https://github.com/moosecreates/tailtown/actions
   - You should see "Test Suite" running
   - Wait for it to complete (green checkmark)

### Test PR Checks

1. **Create a test branch**:
   ```bash
   git checkout -b test/ci-cd
   echo "# CI/CD Test" >> README.md
   git add README.md
   git commit -m "test: CI/CD validation"
   git push origin test/ci-cd
   ```

2. **Create Pull Request**:
   - Go to https://github.com/moosecreates/tailtown/pulls
   - Click "New pull request"
   - Base: `development`, Compare: `test/ci-cd`
   - Create PR

3. **Watch Checks Run**:
   - Code Quality Checks
   - Quick Test Suite
   - Build Verification
   - All should pass ✅

4. **Merge or Close** the test PR

---

## 5. Configure Notifications (Optional)

### Email Notifications

1. **Go to Settings → Notifications**:
   - https://github.com/settings/notifications

2. **Configure**:
   - ✅ Actions: Failed workflows
   - ✅ Pull requests: Reviews, comments
   - ✅ Issues: Mentions

### Slack Integration (Optional)

If you use Slack:

1. Install GitHub app in Slack
2. Subscribe to repository:
   ```
   /github subscribe moosecreates/tailtown
   ```
3. Configure notifications:
   ```
   /github subscribe moosecreates/tailtown workflows:{event:"push" branch:"main"}
   ```

---

## Verification Checklist

After setup, verify:

- [ ] `DEPLOY_SSH_KEY` secret is configured
- [ ] Branch protection is enabled for `main`
- [ ] GitHub Actions are enabled
- [ ] Workflow permissions are set
- [ ] Test workflow runs successfully
- [ ] PR checks work correctly
- [ ] Notifications are configured

---

## Troubleshooting

### Workflows Not Running

**Problem**: Workflows don't trigger on push

**Solution**:
1. Check Actions are enabled in Settings
2. Verify workflow files are in `.github/workflows/`
3. Check branch name matches trigger conditions

### Secret Not Working

**Problem**: Deployment fails with SSH error

**Solution**:
1. Verify secret name is exactly `DEPLOY_SSH_KEY`
2. Check the entire key was copied (including headers)
3. Ensure no extra spaces or newlines

### Status Checks Not Appearing

**Problem**: Can't select status checks in branch protection

**Solution**:
1. Run workflows at least once first
2. Wait a few minutes for GitHub to register them
3. Refresh the branch protection page

### Permission Denied

**Problem**: Workflows can't push or create PRs

**Solution**:
1. Check workflow permissions in Settings → Actions
2. Enable "Read and write permissions"
3. Allow GitHub Actions to create PRs

---

## Next Steps

After completing this setup:

1. ✅ All CI/CD workflows are active
2. ✅ Branch protection prevents bad merges
3. ✅ Automatic testing on every push
4. ✅ Quality gates for pull requests
5. ✅ One-click deployment to production

**Your repository is now production-ready! 🚀**
