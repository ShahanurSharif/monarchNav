# MonarchNav Release Notes v2.2.1

## Overview
This release simplifies MonarchNav back to the v2.1 pattern while preserving the SharePoint element visibility controls from v2.2. This version focuses on stability and SPFx compatibility by removing complex features that were causing installation issues.

## 🔧 Key Features

### SharePoint Element Visibility Controls (from v2.2)
- **Default Header** (`is_sp_header`) - Toggle SharePoint default header visibility
- **Suite Navigation** (`is_suite_nav`) - Control SuiteNavWrapper element 
- **Command Bar** (`is_command_bar`) - Toggle spCommandBar visibility
- **App Bar** (`is_app_bar`) - Control sp-appBar element visibility

### Core Navigation Features (v2.1 Base)
- **Hierarchical Navigation**: Parent items with dropdown children
- **Auto-save Functionality**: Immediate save of navigation changes
- **Theme Customization**: Background color, text color, logo, font size
- **Padding Control**: Top & bottom padding adjustment
- **Simple UI**: Clean, professional interface without complexity

## 📋 Configuration Structure

```json
{
  "themes": {
    "backgroundColor": "#ffffff",
    "textColor": "#6c757d",
    "is_sp_header": true,
    "is_suite_nav": true,
    "is_command_bar": true,
    "is_app_bar": true,
    "items_font_size": "18px",
    "padding_top_bottom": "20px",
    "logoUrl": ""
  },
  "items": [...]
}
```

## 🚫 Removed Features (from v2.2.0)
To improve SPFx compatibility and installation reliability:

- **Mobile Responsive Design**: Removed hamburger menu and mobile-specific layouts
- **Complex Animations**: Eliminated advanced CSS animations and transitions  
- **Professional UI Overhaul**: Simplified button styling and layouts
- **Two-Column Theme Modal**: Returned to simple single-column layout
- **Mobile State Management**: Removed responsive detection and mobile menu state
- **Advanced Dropdown Styling**: Simplified dropdown menus without glass-morphism effects

## 🛠️ Technical Improvements

### Simplified Architecture
- **Minimal CSS**: Reduced complexity in styling and animations
- **Basic Navigation**: Simple dropdown functionality without timeouts or complex hover states
- **Standard Components**: Using basic Fluent UI components without extensive customization
- **Reduced Bundle Size**: Smaller footprint for faster loading and better compatibility

### SPFx Compatibility
- **Installation Reliability**: Removed features that caused SPFx deployment issues
- **Minimal Dependencies**: Reduced complexity to core functionality only
- **Standard Patterns**: Following SharePoint Framework best practices

## 🎯 Usage

### SharePoint Element Controls
The four SharePoint element toggles allow you to show/hide:
1. **Default Header**: Main SharePoint site header (`spSiteHeader`, `spHeader`)
2. **Suite Navigation**: Office 365 suite navigation (`SuiteNavWrapper`)  
3. **Command Bar**: SharePoint command bar (`spCommandBar`)
4. **App Bar**: SharePoint app bar (`sp-appBar`)

### Navigation Management
- Click the edit icon to enter edit mode
- Use "Add Navigation" to create new items
- Use "Nav Theme" (settings icon) to access theme controls
- Edit and delete buttons appear in edit mode for each navigation item

## 🚀 Deployment

### Installation Steps
1. Upload the `.sppkg` file to your SharePoint App Catalog
2. Approve and deploy the solution
3. Add the Application Customizer to your site
4. Configure navigation items and theme settings

### Upgrade from Previous Versions
- **From v2.1.x**: Seamless upgrade with new SharePoint element controls
- **From v2.2.0**: Configuration preserved, mobile features removed automatically
- **No Breaking Changes**: All existing configurations remain compatible

## 🔧 Configuration Notes

### Default Values
- All SharePoint elements visible by default (`true`)
- White background (#ffffff) with gray text (#6c757d)
- 18px font size with 20px top/bottom padding
- Logo defaults to `/SiteAssets/MonarchNav.png`

### Backwards Compatibility
- Existing v2.1 configurations work without changes
- v2.2 configurations automatically adapt (mobile settings ignored)
- All navigation items and theme settings preserved

---

**Release Date**: December 2024
**SPFx Compatibility**: 1.21.1+
**SharePoint**: Online and On-Premises 2019+

**Breaking Changes**: None - this is a simplification release that maintains backward compatibility while improving installation reliability.

Thank you for using MonarchNav! This release prioritizes stability and ease of deployment while preserving the essential SharePoint element visibility controls. 