# Manus Agent v1.0.0 - Publishing Guide

**Status:** ✅ Ready for Release  
**Version:** 1.0.0  
**Release Date:** April 10, 2026

---

## 📋 Pre-Release Checklist

- [x] Code complete (10,353 lines)
- [x] All tests passing
- [x] Documentation complete
- [x] Build successful (121.51 KB)
- [x] Git tag created (v1.0.0)
- [x] Release notes prepared
- [x] npm configuration ready
- [x] GitHub release script ready
- [x] VS Code extension manifest ready
- [x] Plugin marketplace config ready

---

## 🚀 Publishing Steps

### Step 1: Push to GitHub

```bash
# Push all commits
git push origin main

# Push tag
git push origin v1.0.0
```

### Step 2: Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Publish package
npm publish --access public

# Verify publication
npm view @qing060325/manus-agent
```

**Expected Output:**
```
npm notice 📦 @qing060325/manus-agent@1.0.0
npm notice === Tarball Contents ===
npm notice 121.51 KB  dist/cli.js
npm notice === Dist Files ===
npm notice name: @qing060325/manus-agent
npm notice version: 1.0.0
npm notice ...
```

### Step 3: Create GitHub Release

```bash
# Using GitHub CLI
gh release create v1.0.0 \
  --title "Manus Agent v1.0.0" \
  --notes-file RELEASE_NOTES.md \
  dist/cli.js

# Or run the release script
bash github-release.sh
```

### Step 4: Publish VS Code Extension

```bash
# Install vsce (VS Code Extension manager)
npm install -g vsce

# Package the extension
vsce package

# Publish to VS Code Marketplace
vsce publish

# Verify publication
# https://marketplace.visualstudio.com/items?itemName=Qing060325.manus-agent
```

### Step 5: Publish to Plugin Marketplace

```bash
# Upload to plugin marketplace
curl -X POST https://plugins.manus.im/publish \
  -H "Authorization: Bearer $PLUGIN_API_KEY" \
  -F "plugin=@dist/cli.js" \
  -F "config=@plugin-marketplace-config.json"

# Verify publication
curl https://plugins.manus.im/plugins/manus-agent-core
```

---

## 📦 Distribution Channels

### npm Registry
- **Package Name:** `@qing060325/manus-agent`
- **URL:** https://www.npmjs.com/package/@qing060325/manus-agent
- **Installation:** `npm install -g @qing060325/manus-agent`

### GitHub Releases
- **URL:** https://github.com/Qing060325/-agent/releases/tag/v1.0.0
- **Assets:** cli.js (121.51 KB)
- **Download:** Direct from GitHub

### VS Code Marketplace
- **Extension ID:** `Qing060325.manus-agent`
- **URL:** https://marketplace.visualstudio.com/items?itemName=Qing060325.manus-agent
- **Installation:** Search "Manus Agent" in VS Code Extensions

### Plugin Marketplace
- **Plugin ID:** `manus-agent-core`
- **URL:** https://plugins.manus.im/plugins/manus-agent-core
- **Installation:** `/plugins install manus-agent-core`

---

## 🔐 Security & Verification

### Code Signing
```bash
# Sign the release
gpg --detach-sign dist/cli.js

# Verify signature
gpg --verify dist/cli.js.sig dist/cli.js
```

### Checksum Verification
```bash
# Generate checksums
sha256sum dist/cli.js > dist/cli.js.sha256
md5sum dist/cli.js > dist/cli.js.md5

# Verify checksums
sha256sum -c dist/cli.js.sha256
md5sum -c dist/cli.js.md5
```

---

## 📊 Post-Release Actions

### 1. Update Documentation
- [ ] Update main README with v1.0.0 link
- [ ] Add v1.0.0 to version selector
- [ ] Update installation instructions
- [ ] Add v1.0.0 to changelog

### 2. Announce Release
- [ ] Post on GitHub Discussions
- [ ] Tweet announcement
- [ ] Update project website
- [ ] Send email to subscribers

### 3. Monitor Metrics
- [ ] Track npm downloads
- [ ] Monitor GitHub stars
- [ ] Check VS Code extension ratings
- [ ] Review user feedback

### 4. Support & Maintenance
- [ ] Monitor GitHub issues
- [ ] Respond to user questions
- [ ] Plan v1.0.1 hotfix if needed
- [ ] Start v1.1.0 planning

---

## 🎯 Success Criteria

- [x] Build completes without errors
- [x] All tests pass
- [x] Documentation is complete
- [x] Git history is clean
- [x] Version tag is created
- [x] Release notes are prepared
- [ ] Published to npm (pending)
- [ ] Published to GitHub Releases (pending)
- [ ] Published to VS Code Marketplace (pending)
- [ ] Published to Plugin Marketplace (pending)

---

## 📞 Support

For questions or issues during release:
1. Check existing GitHub issues
2. Create a new GitHub issue
3. Contact maintainer: Qing060325

---

## 📝 Version History

### v1.0.0 (2026-04-10)
- Initial release
- 40 tools, 96 commands
- Enterprise features
- Full documentation
- Production ready

---

**Ready to release! 🚀**
