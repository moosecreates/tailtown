#!/bin/bash

# Git Commit and Push Script
# Commits all changes for POS Integration & Reporting System

echo "🚀 Preparing to commit POS Integration & Reporting System..."
echo ""

# Check git status
echo "📊 Current git status:"
git status
echo ""

# Add all files
echo "➕ Adding all files..."
git add .
echo ""

# Show what will be committed
echo "📝 Files to be committed:"
git status --short
echo ""

# Commit with message from file
echo "💾 Committing changes..."
git commit -F COMMIT_MESSAGE.txt
echo ""

# Show commit info
echo "✅ Commit created:"
git log -1 --stat
echo ""

# Ask before pushing
read -p "🚀 Push to remote? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📤 Pushing to remote..."
    git push
    echo ""
    echo "✅ Push complete!"
else
    echo "⏸️  Push skipped. Run 'git push' when ready."
fi

echo ""
echo "🎉 Done!"
