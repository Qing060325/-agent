#!/bin/bash

# Manus Agent v1.0 Build Script

set -e

echo "🔨 Building Manus Agent v1.0..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Build with Bun
echo "Building with Bun..."
bun build src/entrypoints/cli.tsx \
  --outdir dist \
  --target bun \
  --minify \
  --sourcemap=external

# Create executable
echo "Creating executable..."
mkdir -p build/
cp dist/cli.js build/manus-agent
chmod +x build/manus-agent

# Create standalone binary (if possible)
echo "Creating standalone binary..."
bun build src/entrypoints/cli.tsx \
  --outdir build \
  --target bun \
  --minify \
  --sourcemap=external

# Copy package.json for dependencies
cp package.json build/

echo "✅ Build complete!"
echo "📦 Output: ./build/manus-agent"
echo "📊 Build size: $(du -sh build/ | cut -f1)"

# Show build info
echo ""
echo "Build Info:"
echo "- Version: v1.0.0"
echo "- Target: Node.js/Bun"
echo "- Output: build/manus-agent"
echo ""
echo "To run: ./build/manus-agent"
echo "To install globally: sudo cp build/manus-agent /usr/local/bin/manus"
