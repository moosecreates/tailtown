#!/bin/bash

echo "📚 Installing documentation update hooks..."

# Create pre-commit hook for doc reminders
cat > .git/hooks/pre-commit-docs << 'EOF'
#!/bin/bash

# Files that trigger doc updates
CRITICAL_FILES="prisma/schema|middleware|jwt.ts|.env.example|docker-compose"

# Check if any critical files changed
CHANGED=$(git diff --cached --name-only | grep -E "$CRITICAL_FILES")

if [ ! -z "$CHANGED" ]; then
    echo ""
    echo "⚠️  DOCUMENTATION UPDATE REMINDER"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Critical files changed:"
    echo "$CHANGED" | sed 's/^/  • /'
    echo ""
    echo "Consider updating:"
    echo "  📄 docs/operations/DISASTER-RECOVERY-PLAN.md"
    echo "  📄 docs/CURRENT-SYSTEM-ARCHITECTURE.md"
    echo "  📄 docs/security/SECURITY-IMPLEMENTATION.md"
    echo "  📄 docs/CRITICAL-DOCS-REGISTRY.md"
    echo ""
    echo "Press Enter to continue or Ctrl+C to cancel..."
    read
fi
EOF

chmod +x .git/hooks/pre-commit-docs

# Add to main pre-commit hook
if [ -f .git/hooks/pre-commit ]; then
    # Append to existing hook
    if ! grep -q "pre-commit-docs" .git/hooks/pre-commit; then
        echo "" >> .git/hooks/pre-commit
        echo "# Documentation reminder" >> .git/hooks/pre-commit
        echo ".git/hooks/pre-commit-docs" >> .git/hooks/pre-commit
    fi
else
    # Create new hook that calls doc hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
.git/hooks/pre-commit-docs
EOF
    chmod +x .git/hooks/pre-commit
fi

echo "✅ Documentation hooks installed!"
echo ""
echo "Now when you commit changes to critical files, you'll be reminded to update docs."
