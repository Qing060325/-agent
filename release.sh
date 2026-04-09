#!/bin/bash

# Manus Agent v1.0 Release Script

set -e

VERSION="1.0.0"
REPO="Qing060325/-agent"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

echo "🚀 Releasing Manus Agent v${VERSION}..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
  echo "❌ Git working directory is not clean"
  exit 1
fi

# Build
echo "Building..."
bash build.sh

# Create release tag
echo "Creating release tag..."
git tag -a "v${VERSION}" -m "Release v${VERSION}"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main
git push origin "v${VERSION}"

# Create GitHub release
echo "Creating GitHub release..."
if [ -n "$GITHUB_TOKEN" ]; then
  gh release create "v${VERSION}" \
    --title "Manus Agent v${VERSION}" \
    --notes "Manus Agent v${VERSION} - Enterprise AI Agent Platform" \
    build/manus-agent
fi

# Publish to npm (if applicable)
echo "Publishing to npm..."
npm publish --access public

echo "✅ Release complete!"
echo "📦 GitHub Release: https://github.com/${REPO}/releases/tag/v${VERSION}"
echo "📚 NPM Package: https://www.npmjs.com/package/manus-agent"

# Show installation instructions
echo ""
echo "Installation Instructions:"
echo "=========================="
echo ""
echo "Using npm:"
echo "  npm install -g manus-agent"
echo ""
echo "Using Homebrew (macOS):"
echo "  brew install Qing060325/manus/manus-agent"
echo ""
echo "Using GitHub Releases:"
echo "  wget https://github.com/${REPO}/releases/download/v${VERSION}/manus-agent"
echo "  chmod +x manus-agent"
echo "  sudo mv manus-agent /usr/local/bin/"
echo ""
echo "Quick Start:"
echo "  manus --help"
echo "  manus /ask 'What can you do?'"
