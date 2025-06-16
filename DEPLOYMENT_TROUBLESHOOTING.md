# MonarchNav SPFx Deployment Troubleshooting Guide

## Overview
This guide helps resolve common deployment and functionality issues with the MonarchNav SharePoint Framework extension.

## Package Validation

### ✅ **Build and Package Status**
- ✅ Solution builds successfully (`gulp build --production`)
- ✅ Bundle creation works (`gulp bundle --ship`) 
- ✅ Package generation completes (`gulp package-solution --ship`)
- ✅ Package file created at: `sharepoint/solution/monarch-nav.sppkg`

## Fixed Issues

### 1. **Enhanced Error Handling**
- ✅ Added fallback configuration when config file fails to load
- ✅ Added try-catch blocks for critical initialization errors
- ✅ Improved logging with proper Error objects
- ✅ Added fallback navigation rendering if React components fail

### 2. **Testing Support**
- ✅ Added `data-testid="monarch-nav-root"` for e2e testing
- ✅ Updated Playwright tests to use correct HTTPS URL

### 3. **Configuration Properties**
- ✅ Updated extension properties from test values to production values
- ✅ Changed `testMessage` to `debugMode` flag
- ✅ Updated both `elements.xml` and `ClientSideInstance.xml`

## Deployment Checklist

### Pre-Deployment
1. **Build Verification**
   ```bash
   gulp clean
   gulp build --production
   gulp bundle --ship
   gulp package-solution --ship
   ```

2. **Package File Check**
   - Verify `sharepoint/solution/monarch-nav.sppkg` exists
   - File size should be reasonable (not 0 bytes)

### SharePoint App Catalog Deployment
1. **Upload Package**
   - Go to SharePoint Admin Center → Apps → App Catalog
   - Upload `monarch-nav.sppkg`
   - Select "Make this solution available to all sites"

2. **Trust the Solution**
   - When prompted, click "Trust It" to approve permissions
   - Wait for deployment to complete

### Site Collection Installation
1. **Add to Site**
   - Go to target SharePoint site
   - Site Contents → New → App
   - Find "MonarchNav" and click "Add"

2. **Verify Installation**
   - Check if extension appears in site extensions list
   - Navigate to any page to see if navigation appears

## Common Issues and Solutions

### Issue 1: Extension Not Appearing
**Symptoms:** Extension installed but no navigation visible
**Solutions:**
- Check browser console for JavaScript errors
- Verify config file was deployed to `SiteAssets/monarchNavConfig.json`
- Check if SharePoint header is hidden (extension might be working but not visible)

### Issue 2: Config File Missing
**Symptoms:** Error messages about config loading
**Solutions:**
- Extension now has fallback config - basic navigation should still appear
- Manually upload `sharepoint/assets/monarchNavConfig.json` to Site Assets
- Check file permissions in Site Assets library

### Issue 3: Permissions Issues
**Symptoms:** Access denied errors
**Solutions:**
- Ensure user has appropriate SharePoint permissions
- Re-trust the solution in App Catalog
- Check site collection features are activated

### Issue 4: JavaScript Errors
**Symptoms:** Console errors about React or component loading
**Solutions:**
- Clear browser cache and reload
- Check if other SPFx extensions conflict
- Verify SharePoint Modern Experience is enabled

## Debugging Steps

### 1. Browser Console Check
```javascript
// Check if extension loaded
window.spfxApplicationCustomizers

// Check for errors
console.log('MonarchNav errors:', window.errors)
```

### 2. Network Tab Verification
- Look for 404 errors on .js files
- Check if config file loads from SiteAssets
- Verify CSS and image assets load correctly

### 3. SharePoint Workbench Testing
- Test in `https://yourtenant.sharepoint.com/_layouts/15/workbench.aspx`
- Add extension manually with component ID: `99e2cc8b-a0a9-4b8b-9cd3-b80abd2aef49`

## Support Information

### Extension Details
- **Component ID:** `99e2cc8b-a0a9-4b8b-9cd3-b80abd2aef49`
- **Version:** 1.1.0.0
- **SharePoint Framework:** 1.21.1
- **Required permissions:** Basic site access

### Files to Check
- Main package: `sharepoint/solution/monarch-nav.sppkg`
- Config file: `sharepoint/assets/monarchNavConfig.json`
- Logo file: `sharepoint/assets/monarchNav.png`
- Element manifests: `sharepoint/assets/elements.xml`

### Log Sources
- Browser console: Look for "MonarchNavApplicationCustomizer" entries
- SharePoint ULS logs: Search for "MonarchNav" entries
- Network tab: Check for failed resource loads

## Advanced Troubleshooting

### Re-deployment Steps
1. Remove from site: Site Contents → MonarchNav → Remove
2. Update App Catalog: Upload new .sppkg version
3. Reinstall on site
4. Hard refresh browser (Ctrl+F5)

### Manual Asset Deployment
If automatic asset deployment fails:
1. Go to Site Assets library
2. Upload `monarchNavConfig.json` manually
3. Upload `monarchNav.png` manually
4. Verify file permissions allow read access

### Feature Activation
```powershell
# PowerShell - if features need manual activation
Enable-SPFeature -Identity "7c7c26cf-e427-4095-afad-7fce1ca277fa" -Url "https://yourtenant.sharepoint.com/sites/yoursite"
```

This deployment package includes all necessary fixes and should resolve the installation issues you experienced.
