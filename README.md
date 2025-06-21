# MonarchNav - Custom SharePoint Navigation

## Summary

MonarchNav is a SharePoint Framework (SPFx) Application Customizer that provides modern, branded navigation functionality for SharePoint Online sites. It features hierarchical navigation with dropdown menus, theme customization, and a user-friendly configuration interface.

### Key Features
- **Custom Branded Navigation**: Replace default SharePoint navigation with custom branding
- **Hierarchical Menus**: Support for multi-level navigation with dropdown menus
- **Theme Customization**: Configure colors, fonts, logo, and styling
- **Modal-based Configuration**: User-friendly edit interface with modal dialogs
- **Auto-save**: Automatic saving of navigation changes
- **Responsive Design**: Mobile-friendly navigation that adapts to different screen sizes

## Version 2.0.0

![version](https://img.shields.io/badge/version-2.0.0-green.svg)
![SPFx](https://img.shields.io/badge/SPFx-1.21.1-green.svg)
![Node](https://img.shields.io/badge/Node-22.x-green.svg)

## Developer Documentation

📚 **[Complete Developer Guide](./dev_documentation/dev_guide.md)** - Comprehensive documentation for developers including:
- Project architecture and structure
- Component documentation
- Extension points and customization guide
- Development workflows and best practices
- Testing and deployment instructions

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- Node.js 22.x
- SharePoint Framework development environment
- SharePoint Online tenant with App Catalog
- Visual Studio Code (recommended)

## Quick Start

### Installation

1. **Download the Package**
   ```bash
   # Download the latest .sppkg file from releases
   # Or build from source (see Development section)
   ```

2. **Deploy to SharePoint**
   - Upload `monarch-nav-theme.sppkg` to your SharePoint App Catalog
   - Deploy the solution to make it available across sites
   - Add the extension to your SharePoint sites

3. **Configure Navigation**
   - Navigate to any page where the extension is active
   - Click the "Edit" button (requires appropriate permissions)
   - Use the "⚙️" button to configure themes
   - Use "Add Navigation" to manage navigation items

### Usage

- **Theme Configuration**: Click the settings (⚙️) button to customize colors, logo, and fonts
- **Navigation Management**: Click "Add Navigation" to create hierarchical navigation menus
- **Auto-save**: Changes to navigation items are automatically saved
- **Responsive Design**: Navigation adapts to mobile and tablet screens

## Development

### Build and Run Locally

```bash
# Install dependencies
npm install

# Start development server
gulp serve

# Build for production
npm run build
gulp package-solution --ship
```

For detailed development instructions, see the [Developer Guide](./dev_documentation/dev_guide.md).

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| MonarchNav | Shahanur Sharif (Shan) - Monarch360 |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 2.0.0   | January 2025     | Modular architecture with separate modal components, improved TypeScript support |
| 1.1.0   | December 2024    | Enhanced theme customization and navigation features |
| 1.1     | March 10, 2021   | Update comment  |
| 1.0     | January 29, 2021 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **gulp serve**

> Include any additional steps as needed.

## Features

Description of the extension that expands upon high-level summary above.

This extension illustrates the following concepts:

- topic 1
- topic 2
- topic 3

> Notice that better pictures and documentation will increase the sample usage and the value you are providing for others. Thanks for your submissions advance.

> Share your web part with others through Microsoft 365 Patterns and Practices program to get visibility and exposure. More details on the community, open-source projects and other activities from http://aka.ms/m365pnp.

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
