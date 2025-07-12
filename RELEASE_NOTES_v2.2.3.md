# MonarchNav v2.2.3 Release Notes

**Release Date:** June 30, 2025  
**Version:** 2.2.3  
**Package:** `monarch-nav-theme.sppkg`

---

## New Features

### 1. Logo Management Enhancements
- **Logo Deletion**: Added delete button beside logo in theme settings
  - Click the trash icon next to the logo preview to remove custom logos
  - Automatically reverts to default logo when deleted
  - Confirmation dialog prevents accidental deletion
- **Dynamic Logo URLs**: Logo now uses dynamic site URLs instead of hardcoded paths
  - Automatically resolves to current SharePoint site's `/SiteAssets/MonarchNav.png`
  - Works across different SharePoint sites without manual configuration
  - No more broken logo links when deploying to different environments

### 2. Enhanced User Experience
- **Clickable Logo**: Logo in navigation header is now clickable
  - Click logo to navigate to site home page
  - Follows standard web conventions for logo behavior
  - Works in both normal and edit modes
- **Improved Theme Settings Layout**: SharePoint Element Visibility toggles now properly aligned
  - Toggle buttons aligned to the right side for better visual hierarchy
  - Consistent spacing and alignment across all toggle options
  - More professional and intuitive settings interface

---

## Technical Improvements

### Logo URL Resolution
```typescript
// Dynamic site URL resolution
const getSiteUrl = (): string => {
    if (context?.pageContext?.web?.absoluteUrl) {
        return context.pageContext.web.absoluteUrl;
    }
    return window.location.origin;
};

// Logo now uses: `${siteUrl}/SiteAssets/MonarchNav.png`
```

### Logo Deletion Implementation
```typescript
// Delete button only shows when custom logo is set
{config.themes.logoUrl && (
    <IconButton
        iconProps={{ iconName: "Delete" }}
        onClick={handleDeleteLogo}
        // ... styling
    />
)}

// Deletion handler
const handleDeleteLogo = (): void => {
    if (window.confirm('Are you sure you want to delete the logo?')) {
        updateTheme("logoUrl", "");
    }
};
```

### Clickable Logo Implementation
```typescript
// Logo wrapped with site home URL
<a href={props.context.pageContext.web.absoluteUrl}>
    <img src={logoUrl || `${siteUrl}/SiteAssets/MonarchNav.png`} />
</a>
```

---

## User Benefits

### For Administrators:
- **Easy Logo Management**: Upload, preview, and delete logos with simple clicks
- **Cross-Site Compatibility**: Logo works automatically on any SharePoint site
- **Professional Settings**: Better organized theme settings with proper alignment

### For End Users:
- **Intuitive Navigation**: Click logo to return to site home (standard web behavior)
- **Consistent Experience**: Logo always displays correctly regardless of site
- **Visual Polish**: Cleaner, more professional navigation interface

---

## Migration Notes

### Automatic Migration:
- Existing logos will continue to work as before
- Default logo paths automatically updated to use dynamic URLs
- No manual configuration changes required

### Configuration Updates:
- `logoUrl` property now defaults to empty string (`""`) in new installations
- Dynamic URL resolution handles fallback to default logo
- All existing theme settings preserved

---

## Deployment

### Build Commands:
```bash
gulp build --ship
gulp bundle --ship
gulp package-solution --ship
```

### Package Details:
- **File:** `sharepoint/solution/monarch-nav-theme.sppkg`
- **Size:** Optimized for SharePoint deployment
- **Compatibility:** SharePoint Online (all modern browsers)

---

## Bug Fixes

- **Fixed:** Logo URLs now work correctly across different SharePoint sites
- **Fixed:** Theme settings toggle alignment improved for better usability
- **Fixed:** Logo deletion properly clears configuration and reverts to default

---

## Testing Checklist

### Logo Management:
- [ ] Upload custom logo via theme settings
- [ ] Preview logo displays correctly
- [ ] Delete logo button appears when custom logo is set
- [ ] Delete logo confirmation dialog works
- [ ] Logo reverts to default after deletion

### Dynamic URLs:
- [ ] Logo displays correctly on different SharePoint sites
- [ ] Default logo path resolves to correct site assets
- [ ] No broken image links in any environment

### Clickable Logo:
- [ ] Logo is clickable in navigation header
- [ ] Clicking logo navigates to site home page
- [ ] Works in both normal and edit modes
- [ ] Proper cursor pointer on hover

### Theme Settings:
- [ ] SharePoint Element Visibility toggles aligned to right
- [ ] All toggle options display correctly
- [ ] Settings save and load properly

---

## What's Next

This release focuses on improving logo management and user experience. Future releases may include:
- Additional theme customization options
- Enhanced mobile responsiveness
- Advanced navigation features
- Performance optimizations

---

**Status:** READY FOR DEPLOYMENT  
**Package:** `monarch-nav-theme.sppkg`  
**Implementation:** Complete with logo management and dynamic URL support

---

*For support or feature requests, contact the MonarchNav development team.* 