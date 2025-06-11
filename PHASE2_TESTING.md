# 🎯 MonarchNav Phase 2 - Navigation Management Testing Guide

## ✅ Phase 2 Implementation Complete!

### 🚀 **What's New in Phase 2:**
- **Navigation Callout**: Opens when clicking "Add/Edit Navigation" button
- **Navigation Form**: Complete form with Title, Link, Open In dropdown, Description
- **CRUD Operations**: Add, Edit, and manage navigation items
- **Integration**: Seamlessly works with existing save/cancel functionality
- **SharePoint Persistence**: Saves to `monarchNavConfig.json` in Site Assets

---

## 🧪 **Manual Testing Checklist**

### **Step 1: Start Development Server**
```bash
cd /Users/shahanurmdsharif/development/monarch360/monarchNav
gulp serve
```

### **Step 2: Access SharePoint Workbench**
1. Open: `https://your-tenant.sharepoint.com/_layouts/15/workbench.aspx`
2. Add the MonarchNav Application Customizer
3. You should see the "MonarchNav" header at the top

### **Step 3: Test Navigation Management**

#### **3.1 Enable Edit Mode**
- [ ] Click the Edit button (pencil icon) on the right side of the header
- [ ] Verify "Add/Edit Navigation" button appears
- [ ] Verify debug info shows "Edit Mode: ON"

#### **3.2 Open Navigation Dialog**
- [ ] Click "Add/Edit Navigation" button
- [ ] Verify callout opens with `id="navigation_callout"`
- [ ] Verify form title shows "Add Navigation Item"
- [ ] Verify form contains these fields:
  - [ ] **Title** (required, single line text)
  - [ ] **Link** (required, single line text)
  - [ ] **Open in** (dropdown with "Same tab (default)" and "New tab")
  - [ ] **Description** (optional, single line text)

#### **3.3 Test Form Validation**
- [ ] Try to save with empty Title → Should show validation error
- [ ] Try to save with empty Link → Should show validation error
- [ ] Enter invalid URL (like "abc") → Should show validation error
- [ ] Enter valid URL → No validation errors should appear
- [ ] Save button should be disabled when validation errors exist

#### **3.4 Test Adding Navigation Item**
- [ ] Fill in Title: "Test Page"
- [ ] Fill in Link: "https://microsoft.com"
- [ ] Select Open in: "New tab"
- [ ] Fill in Description: "Microsoft homepage"
- [ ] Click Save
- [ ] Verify dialog closes
- [ ] Verify new navigation item appears in header
- [ ] Verify debug info shows "Navigation Items: 1"

#### **3.5 Test Link Functionality**
- [ ] Exit edit mode (click Edit button again)
- [ ] Click the new "Test Page" link
- [ ] Verify it opens in new tab (based on target setting)
- [ ] Hover over link to see tooltip with description

#### **3.6 Test Edit Existing Navigation**
- [ ] Re-enter edit mode
- [ ] Click on existing "Test Page" navigation item
- [ ] Verify dialog opens with form populated with existing data
- [ ] Verify form title shows "Edit Navigation Item"
- [ ] Modify the title to "Updated Test Page"
- [ ] Click Save
- [ ] Verify navigation item updates in header

#### **3.7 Test Configuration Persistence**
- [ ] Add 2-3 navigation items with different settings
- [ ] Click Settings gear icon
- [ ] Click Save to persist configuration
- [ ] Refresh the page
- [ ] Verify all navigation items are still there
- [ ] Check Site Assets library for `monarchNavConfig.json` file

---

## 🔧 **Expected Behavior**

### **Navigation Form Fields:**
1. **Title**: 
   - Required field
   - Max 50 characters
   - Shows as button text in navigation
   
2. **Link**: 
   - Required field
   - URL validation (must be valid URL format)
   - Supports both absolute URLs and relative paths
   
3. **Open in**: 
   - Dropdown with two options
   - "Same tab (default)" = `_self`
   - "New tab" = `_blank`
   
4. **Description**: 
   - Optional field
   - Max 100 characters
   - Used as tooltip for accessibility

### **Button Behavior:**
- **Cancel**: Closes dialog without saving, resets form
- **Save**: Validates form, saves item, closes dialog, updates navigation

### **Edit Mode Behavior:**
- **Normal Mode**: Navigation items are clickable links
- **Edit Mode**: Navigation items show edit icon (✏️) and open edit dialog when clicked

---

## 🎯 **Configuration Storage**

### **JSON Structure** (`monarchNavConfig.json`):
```json
{
  "themes": {
    "backgroundColor": "#0078d4",
    "textColor": "#ffffff",
    "is_sp_header": true,
    "items_font_size": "18px"
  },
  "items": [
    {
      "name": "Test Page",
      "link": "https://microsoft.com",
      "target": "_blank",
      "description": "Microsoft homepage"
    }
  ]
}
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Callout not opening**: 
   - Check browser console for errors
   - Verify Edit mode is enabled

2. **Validation errors not showing**:
   - Clear form and try again
   - Check that required fields are properly marked

3. **Navigation items not saving**:
   - Check Site Assets library permissions
   - Verify no console errors during save

4. **Items not appearing after refresh**:
   - Check if `monarchNavConfig.json` exists in Site Assets
   - Verify JSON format is valid

### **Debug Information:**
Development builds show debug info at the bottom:
- Navigation Items count
- Edit Mode status  
- Unsaved Changes indicator
- Navigation Dialog status

---

## ✅ **Success Criteria**

Phase 2 is successfully implemented when:
- [ ] Navigation callout opens with all required fields
- [ ] Form validation works correctly
- [ ] Navigation items can be added and edited
- [ ] Items persist across page refreshes
- [ ] Edit mode allows clicking items to edit them
- [ ] Normal mode allows clicking items to navigate
- [ ] Configuration saves to SharePoint Site Assets

---

**Package Ready**: `sharepoint/solution/monarch-nav.sppkg`
**Implementation Status**: ✅ **COMPLETE**
