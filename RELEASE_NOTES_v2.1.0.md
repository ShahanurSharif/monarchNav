# MonarchNav Release Notes v2.1.0.0

## Features & Improvements
- **Unified Top & Bottom Padding:**
  - Added a single `padding_top_bottom` setting for consistent vertical spacing in the navigation header.
  - Padding is now only applied to the top and bottom, not left/right.
- **Theme Settings Modal:**
  - New slider for "Top & Bottom Padding" in the theme modal for easy adjustment.
  - UI cleanup: removed redundant/legacy padding controls.
- **Header Text Display:**
  - Main navigation header text display is now fixed and consistent across all layouts.
- **Versioning & Packaging:**
  - Upgraded solution version to `2.1.0.0` for this release.
  - All changes are tagged and packaged for production deployment.

## Bug Fixes
- Fixed: Padding was previously applied to left/right unintentionally.
- Fixed: Header text sometimes did not display as expected.

---

**Deployment:**
- Upload the new `.sppkg` file to the SharePoint App Catalog.
- Approve and deploy as usual.

---

Thank you for using MonarchNav!
