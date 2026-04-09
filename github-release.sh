#!/bin/bash

# GitHub Release Script for Manus Agent v1.0.0

set -e

echo "🚀 Starting GitHub Release Process..."

# Get version from package.json
VERSION=$(grep '"version"' package.json | head -1 | awk -F'"' '{print $4}')
TAG="v${VERSION}"

echo "📦 Version: $VERSION"
echo "🏷️  Tag: $TAG"

# Check if tag exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "✅ Tag $TAG already exists"
else
    echo "❌ Tag $TAG not found. Please create it first:"
    echo "   git tag -a $TAG -m 'Release $TAG'"
    exit 1
fi

# Create release notes
RELEASE_NOTES=$(cat RELEASE_NOTES.md)

echo ""
echo "📝 Release Notes:"
echo "================="
echo "$RELEASE_NOTES" | head -20
echo "..."
echo ""

# Instructions for manual release
echo "📋 To create a GitHub release, run:"
echo ""
echo "gh release create $TAG \\"
echo "  --title 'Manus Agent $VERSION' \\"
echo "  --notes-file RELEASE_NOTES.md \\"
echo "  dist/cli.js"
echo ""

echo "✅ Release preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push tag: git push origin $TAG"
echo "2. Create release: gh release create $TAG --notes-file RELEASE_NOTES.md dist/cli.js"
echo "3. Upload assets if needed"
