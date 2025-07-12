# Release Notes – MonarchNav v2.2.2

**Release Date:** June 30, 2025

## 🎉 New Features

### Navigation Theme Improvements
- **Enhanced Theme Dialog UX**: Edit and delete icons now hide automatically when the Nav Theme dialog is open, providing a cleaner interface experience
- **Menu Items Alignment Control**: Added new "Align Menu Items" dropdown with Left, Center, and Right alignment options for precise navigation positioning
- **Left & Right Padding Control**: Added dedicated slider for horizontal padding control alongside the existing Top & Bottom padding control

### UI/UX Enhancements
- **Side-by-Side Controls**: Menu Font Style and Align Menu Items controls are now positioned side by side for better space utilization
- **Improved Edit Button Placement**: Edit Navigation button is now properly positioned within the navigation container for consistent alignment behavior
- **Optimized Default Values**: Updated default padding values to 8px for both vertical and horizontal spacing

## 🔧 Technical Improvements
- **Enhanced Flex Layout**: Navigation container now uses proper flex properties for responsive alignment
- **Configuration Updates**: Added `items_alignment` and `padding_left_right` properties to configuration schema
- **Consistent Defaults**: Synchronized default values across all configuration files

## 📋 Configuration Schema Updates
- Added `items_alignment: string` property (default: "left")
- Added `padding_left_right: string` property (default: "8px")
- Updated `padding_top_bottom` default value to "8px"

## 🎯 User Experience
- **Professional Interface**: Clean theme configuration experience without distracting edit controls
- **Precise Control**: Granular control over navigation spacing and alignment
- **Intuitive Layout**: Logical grouping of related controls in the theme modal

## 🔄 Backward Compatibility
- All existing configurations remain fully compatible
- Automatic fallback to default values for new properties
- No breaking changes to existing functionality

## 📦 Deployment Notes
- Solution package updated to v2.2.1
- Configuration file updated with new default values
- Ready for deployment to SharePoint environments

---
**Package**: `monarch-nav.sppkg` v2.2.2  
**Based on**: SPFx 1.21.1  
**Compatibility**: SharePoint Online, SharePoint 2019+  

For detailed installation and configuration instructions, see the main documentation. 