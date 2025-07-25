# MonarchNav SharePoint Framework Application Customizer

## Project Overview
MonarchNav is a SharePoint Framework (SPFx) Application Customizer that provides custom navigation functionality for SharePoint Online sites. This extension runs on every page load and can add custom headers, footers, or navigation elements.

## Project Structure
- **src/extensions/monarchNav/**: Main extension source code
- **config/**: SPFx configuration files
- **sharepoint/**: SharePoint-specific assets and deployment files
- **.vscode/**: VS Code configuration files

## Key Technologies
- **SharePoint Framework (SPFx) 1.21.1**: Microsoft's development model for SharePoint customizations
- **TypeScript 5.3.3**: Primary development language
- **Node.js 22.x**: Runtime environment
- **Gulp**: Build system and task runner
- **React**: UI framework (if React components are added)

## Development Guidelines

### Code Style
- Use TypeScript with strict typing
- Follow Microsoft SPFx coding standards
- Use PascalCase for classes and interfaces
- Use camelCase for properties and methods
- Add JSDoc comments for public methods

### Application Customizer Patterns
- Extend `BaseApplicationCustomizer` class
- Implement `onInit()` method for initialization logic
- Use placeholders like `Top` and `Bottom` for content injection
- Handle responsive design considerations
- Implement proper error handling and logging

### SharePoint Context
- Access SharePoint context via `this.context`
- Use `this.context.pageContext` for page information
- Use `this.context.spHttpClient` for SharePoint API calls
- Handle user permissions appropriately

### Performance Best Practices
- Minimize initial bundle size
- Use dynamic imports for heavy components
- Cache frequently used data
- Avoid blocking the page load process
- Use SharePoint's built-in caching mechanisms

## Common Development Tasks

### Building and Testing
- `gulp build`: Build the project
- `gulp serve`: Start development server
- `gulp bundle --ship`: Create production bundle
- `gulp package-solution --ship`: Create SharePoint package

### Deployment
- Upload .sppkg file to SharePoint App Catalog
- Configure extension properties in SharePoint Admin
- Test in different SharePoint environments

### Debugging
- Use browser developer tools
- Enable SharePoint debug mode
- Use VS Code debugging configuration
- Check SharePoint ULS logs for server-side issues

## Common Patterns

### Adding UI Elements
```typescript
// Add content to page placeholders
const topPlaceholder = this.context.placeholderProvider.tryCreateContent(
  PlaceholderName.Top,
  { onDispose: this._onDispose }
);
```

### Making SharePoint API Calls
```typescript
// Use SPHttpClient for SharePoint REST API
const response = await this.context.spHttpClient.get(
  `${this.context.pageContext.web.absoluteUrl}/_api/web`,
  SPHttpClient.configurations.v1
);
```

### Error Handling
```typescript
try {
  // Your code here
} catch (error) {
  Log.error(LOG_SOURCE, error);
  // Handle error appropriately
}
```

## Files to Focus On
- `MonarchNavApplicationCustomizer.ts`: Main extension logic
- `MonarchNavApplicationCustomizer.manifest.json`: Extension manifest
- `package-solution.json`: Solution packaging configuration
- `serve.json`: Development server configuration

## Testing Strategy
- Test in SharePoint Workbench during development
- Test on actual SharePoint sites before deployment
- Test with different user permissions
- Test responsive behavior on mobile devices
- Test browser compatibility

## Deployment Considerations
- Tenant-level vs site-level deployment
- Extension properties configuration
- User permissions and security
- Browser support requirements
- Performance impact on page load
