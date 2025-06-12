# MonarchNav SPFx Extension - Installation & Usage Guide

## Overview
MonarchNav is a SharePoint Framework (SPFx) Application Customizer that provides a modern, configurable navigation bar for SharePoint Online. It supports hierarchical navigation, custom branding, and persistent configuration stored in Site Assets.

---

## Prerequisites
- SharePoint Online tenant with App Catalog
- Site Collection admin permissions
- Node.js 22.x and npm installed
- Gulp CLI installed globally (`npm install -g gulp-cli`)

---

## Installation Steps

### 1. Build and Package the Solution
```sh
# In the project root directory
npm install
gulp build --ship
gulp bundle --ship
gulp package-solution --ship
```
This will generate `monarch-nav.sppkg` in `sharepoint/solution/`.

### 2. Upload to App Catalog
1. Go to your SharePoint Admin Center > **Apps** > **App Catalog**.
2. Upload `monarch-nav.sppkg` to the **Apps for SharePoint** library.
3. Approve the API permissions if prompted.

### 3. Add the App to Your Site
1. Go to the target SharePoint site.
2. Click **Settings > Add an app**.
3. Find and add **MonarchNav**.
4. (Tenant-wide deployment is supported if enabled in the App Catalog.)

### 4. Asset Provisioning
- On first install, `monarchNavConfig.json` and `monarchNav.png` are provisioned to the **Site Assets** library.
- You can update `monarchNavConfig.json` directly in Site Assets for advanced configuration.

---

## Usage

### Edit Navigation
1. Click the **Edit** (pencil) icon in the MonarchNav header.
2. Use **Add Navigation** to add a parent item.
3. Click the **Edit** icon next to a parent or child to edit.
4. Use **Add Child** in the parent edit form to add child items.
5. All changes are auto-saved and persisted to SharePoint.

### Customize Theme
1. Click the **Settings** (gear) icon in the MonarchNav header.
2. Change colors, font size, logo, and font style.
3. Upload a new logo or adjust its size as needed.
4. Changes are auto-saved.

### Deployment Notes
- The extension runs on every page in the site where it is installed.
- All navigation and theme changes are stored in `monarchNavConfig.json` in Site Assets.
- Default logo is `monarchNav.png` in Site Assets.

---

## Troubleshooting
- If navigation or theme changes do not persist, check permissions on Site Assets.
- If the extension does not appear, ensure it is enabled in the site and the app is installed.
- For advanced configuration, edit `monarchNavConfig.json` directly in Site Assets.

---

## Uninstallation
1. Remove the app from the site via **Site Contents**.
2. Optionally, delete `monarchNavConfig.json` and `monarchNav.png` from Site Assets.

---

## Support
For issues or feature requests, contact your SharePoint administrator or the MonarchNav development team.
