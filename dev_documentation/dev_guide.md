# MonarchNav Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [State Management](#state-management)
6. [Extension Points](#extension-points)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Extending the Project](#extending-the-project)

## Project Overview

MonarchNav is a SharePoint Framework (SPFx) Application Customizer that provides custom navigation functionality for SharePoint Online sites. It's built with TypeScript, React, and follows Microsoft's SPFx development model.

### Key Features
- Custom branded navigation header
- Hierarchical navigation with professional dropdown menus
- Mobile responsive design with hamburger menu
- Theme customization (colors, fonts, logo)
- SharePoint element visibility toggles (Header, Suite Nav, Command Bar, App Bar)
- Auto-save functionality
- Modern Fluent UI components and styling
- Professional button and icon designs
- Modal-based configuration UI

### Technology Stack
- **SharePoint Framework (SPFx) 1.21.1**
- **TypeScript 5.3.3**
- **React 17.0.1**
- **Fluent UI React 8.123.0**
- **Node.js 22.x**
- **Gulp** (Build system)

## Architecture

MonarchNav follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    SPFx Application Customizer          │
│  ┌─────────────────────────────────────────────────────┐│
│  │                Container Component                   ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ││
│  │  │ ThemeModal  │  │  NavModal   │  │ Navigation  │ ││
│  │  │ Component   │  │ Component   │  │    UI       │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────┐│
│  │                State Management                      ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ││
│  │  │useConfig    │  │useNavigation│  │Config       │ ││
│  │  │Manager      │  │Manager      │  │Service      │ ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘ ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Design Principles
1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be reused and extended
3. **Type Safety**: Full TypeScript support with strict typing
4. **Performance**: Lazy loading and efficient state management
5. **Accessibility**: ARIA compliance and keyboard navigation
6. **Responsive**: Mobile-first design approach

## Project Structure

```
monarchNav/
├── src/
│   ├── index.ts                              # Entry point
│   └── extensions/
│       └── monarchNav/
│           ├── MonarchNavApplicationCustomizer.ts      # Main extension class
│           ├── MonarchNavApplicationCustomizer.manifest.json
│           ├── MonarchNavConfigService.ts              # Configuration service
│           ├── components/
│           │   ├── Container.tsx                       # Main container component
│           │   ├── ThemeModal.tsx                      # Theme configuration modal
│           │   ├── NavModal.tsx                        # Navigation edit modal
│           │   ├── NavigationItemForm.tsx              # Navigation item form
│           │   └── IContainerProps.ts                  # Container interface
│           ├── hooks/
│           │   ├── useConfigManager.ts                 # Configuration state hook
│           │   └── useNavigationManager.ts             # Navigation state hook
│           └── loc/
│               ├── myStrings.d.ts                      # Localization types
│               └── en-us.js                            # English strings
├── config/
│   ├── package-solution.json                          # SPFx solution config
│   ├── serve.json                                      # Development server config
│   └── ...
├── sharepoint/
│   ├── assets/                                         # SharePoint assets
│   └── solution/                                       # Generated packages
├── dev_documentation/
│   └── dev_guide.md                                    # This file
└── ...
```

## Core Components

### 1. MonarchNavApplicationCustomizer.ts
The main extension class that extends `BaseApplicationCustomizer`. This is the entry point that:
- Initializes the extension
- Creates placeholder providers
- Renders the main Container component
- Manages the extension lifecycle

```typescript
export default class MonarchNavApplicationCustomizer extends BaseApplicationCustomizer<IMonarchNavApplicationCustomizerProperties> {
  public onInit(): Promise<void> {
    // Extension initialization logic
  }
}
```

### 2. Container.tsx
The main React component that orchestrates the entire navigation UI:
- Renders the navigation header
- Manages UI state (edit mode, modals)
- Handles user interactions
- Applies theme settings

**Key Features:**
- Responsive navigation layout
- Hierarchical menu with dropdowns
- Edit mode for administrators
- Theme application
- Modal management

### 3. ThemeModal.tsx
A dedicated modal component for theme customization:
- Color picker for background and text colors
- Logo upload and sizing
- Font size and style selection
- SharePoint header visibility toggle

**Props Interface:**
```typescript
interface IThemeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  config: IMonarchNavConfig;
  updateTheme: (key: string, value: unknown) => void;
  // ... other props
}
```

### 4. NavModal.tsx
A modal component for navigation item management:
- Add/edit navigation items
- Hierarchical structure support
- Form validation
- Auto-save functionality

### 5. NavigationItemForm.tsx
A form component for individual navigation items:
- Input fields for name, description, URL
- Validation logic
- Child item management
- Save/cancel actions

## State Management

MonarchNav uses React hooks for state management with a clear separation between configuration and navigation state.

### useConfigManager Hook
Manages application configuration including themes and settings:

```typescript
const {
  config,
  isSaving,
  isLoading,
  error,
  hasUnsavedChanges,
  updateTheme,
  saveConfig,
  reloadConfig,
  resetConfig,
  updateConfig,
  markAsSaved
} = useConfigManager(context, initialConfig);
```

**Key Features:**
- Auto-save functionality
- Optimistic updates
- Error handling
- Change tracking

### useNavigationManager Hook
Manages navigation items and editing state:

```typescript
const navigationManager = useNavigationManager(
  items,
  onItemsChange
);
```

**Key Features:**
- CRUD operations for navigation items
- Form state management
- Validation
- Auto-save on changes

### MonarchNavConfigService
A service class for SharePoint configuration management:
- Loads configuration from SharePoint list
- Saves configuration to SharePoint
- Handles API communication
- Error handling and retry logic

## Extension Points

### 1. Adding New Theme Properties

To add new theme properties:

1. **Update the configuration interface:**
```typescript
// In useConfigManager.ts or a separate interface file
interface IThemeConfig {
  backgroundColor: string;
  textColor: string;
  logoUrl: string;
  logoSize: string;
  // Add new property
  borderColor: string;
}
```

2. **Update ThemeModal component:**
```typescript
// In ThemeModal.tsx
<div>
  <label>Border Color</label>
  <ColorPicker
    color={config.themes.borderColor}
    onChange={(color) => updateTheme('borderColor', color.str)}
  />
</div>
```

3. **Apply the theme in Container:**
```typescript
// In Container.tsx
const borderColor = config.themes.borderColor;
// Apply to styles...
```

### 2. Adding New Navigation Features

To add new navigation features:

1. **Extend the navigation item interface:**
```typescript
interface INavigationItem {
  name: string;
  description: string;
  link: string;
  children?: INavigationItem[];
  // Add new properties
  icon?: string;
  isExternal?: boolean;
}
```

2. **Update NavigationItemForm:**
```typescript
// Add new form fields
<input
  placeholder="Icon (optional)"
  value={formData.icon || ''}
  onChange={(e) => onFieldChange('icon', e.target.value)}
/>
```

3. **Update the rendering logic in Container:**
```typescript
// Use new properties in navigation rendering
{item.icon && <span className="nav-icon">{item.icon}</span>}
```

### 3. Adding Custom Modals

To add new modal components:

1. **Create the modal component:**
```typescript
// NewFeatureModal.tsx
export const NewFeatureModal: React.FC<INewFeatureModalProps> = (props) => {
  return (
    <Modal isOpen={props.isOpen} onDismiss={props.onDismiss}>
      {/* Modal content */}
    </Modal>
  );
};
```

2. **Add state management in Container:**
```typescript
const [isNewFeatureModalOpen, setIsNewFeatureModalOpen] = useState(false);
```

3. **Integrate with the UI:**
```typescript
<NewFeatureModal
  isOpen={isNewFeatureModalOpen}
  onDismiss={() => setIsNewFeatureModalOpen(false)}
  // ... other props
/>
```

### 4. Extending Configuration Service

To add new configuration sources or methods:

1. **Extend MonarchNavConfigService:**
```typescript
export class MonarchNavConfigService {
  // Existing methods...
  
  public static async loadFromCustomSource(): Promise<IMonarchNavConfig> {
    // Custom loading logic
  }
  
  public static async syncWithExternalSystem(): Promise<void> {
    // External sync logic
  }
}
```

2. **Update useConfigManager to use new methods:**
```typescript
const loadCustomConfig = useCallback(async () => {
  const customConfig = await MonarchNavConfigService.loadFromCustomSource();
  setConfig(customConfig);
}, []);
```

## Development Workflow

### 1. Setting Up Development Environment

```bash
# Install dependencies
npm install

# Start development server
gulp serve

# In another terminal, start TypeScript watch
npm run build -- --watch
```

### 2. Development Commands

```bash
# Build the project
npm run build

# Clean build artifacts
gulp clean

# Create production package
gulp package-solution --ship

# Run tests
npm test

# Lint code
gulp lint
```

### 3. Code Style Guidelines

- Use TypeScript strict mode
- Follow Microsoft SPFx coding standards
- Use PascalCase for components and interfaces
- Use camelCase for functions and variables
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

### 4. Component Development Pattern

```typescript
// 1. Define interfaces
interface IMyComponentProps {
  // Props definition
}

// 2. Create the component
export const MyComponent: React.FC<IMyComponentProps> = (props) => {
  // 3. State management
  const [state, setState] = useState();
  
  // 4. Effects and callbacks
  useEffect(() => {
    // Side effects
  }, []);
  
  const handleAction = useCallback(() => {
    // Event handlers
  }, []);
  
  // 5. Render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

## Mobile Responsiveness

MonarchNav features a fully responsive design that adapts to different screen sizes:

### Responsive Breakpoints
- **Desktop (>768px)**: Full navigation with horizontal layout and hover dropdowns
- **Mobile (≤768px)**: Hamburger menu with slide-out navigation panel

### Mobile Features
- Touch-friendly navigation with large tap targets
- Slide-out menu panel from the right side
- Collapsible parent items with visual indicators
- Mobile-optimized edit mode controls
- Smooth animations and transitions

### Implementation Details
```typescript
// Mobile state management
const [isMobile, setIsMobile] = useState(false);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Responsive detection
React.useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth > 768) {
      setIsMobileMenuOpen(false);
    }
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);
```

## SharePoint Element Control

MonarchNav provides granular control over SharePoint's native UI elements:

### Available Toggles
- **Default Header**: Controls `spSiteHeader`, `spHeader` elements
- **Suite Navigation**: Controls `SuiteNavWrapper` element  
- **Command Bar**: Controls `spCommandBar` element
- **App Bar**: Controls `sp-appBar` element

### Configuration Structure
```typescript
interface IMonarchNavConfig {
  themes: {
    is_sp_header: boolean;     // Default Header toggle
    is_suite_nav: boolean;     // Suite Navigation toggle
    is_command_bar: boolean;   // Command Bar toggle
    is_app_bar: boolean;       // App Bar toggle
    // ... other theme properties
  };
}
```

### CSS Implementation
```typescript
// Dynamic element hiding based on configuration
const applyElementVisibility = (elementId: string, visible: boolean) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = visible ? "" : "none";
  }
};
```

## Professional UI Components

### Modern Button Design
All buttons now use consistent professional styling:
- Fluent UI DefaultButton and IconButton components
- Consistent sizing and spacing
- Professional hover effects and transitions
- Clean typography and color schemes

### Enhanced Dropdown Menus
- White background with sophisticated shadows
- Improved spacing and Typography
- Right-aligned action buttons
- Smooth animations and micro-interactions
- Professional color palette

### Button Implementation Pattern
```typescript
<DefaultButton
  text="Button Text"
  iconProps={{ iconName: "Icon" }}
  styles={{
    root: {
      // Professional styling
    }
  }}
  onClick={handleClick}
/>
```

## Testing

### 1. Unit Testing
Create tests for individual components and utilities:

```typescript
// __tests__/Container.test.tsx
describe('Container', () => {
  it('should render navigation items', () => {
    // Test implementation
  });
});
```

### 2. Integration Testing
Test component interactions and data flow:

```typescript
// __tests__/navigation.integration.test.tsx
describe('Navigation Integration', () => {
  it('should save navigation changes', async () => {
    // Test implementation
  });
});
```

### 3. E2E Testing
Test the complete user workflows:

```typescript
// e2e/navigation.spec.ts
describe('Navigation E2E', () => {
  it('should allow users to edit navigation', () => {
    // Playwright/Cypress test
  });
});
```

## Deployment

### 1. Development Deployment
```bash
# Build and serve locally
gulp serve

# Test in SharePoint Workbench
# Navigate to: https://yourtenant.sharepoint.com/_layouts/workbench.aspx
```

### 2. Production Deployment
```bash
# Create production build
gulp clean
gulp bundle --ship
gulp package-solution --ship

# Upload to SharePoint App Catalog
# 1. Go to SharePoint Admin Center
# 2. Navigate to App Catalog
# 3. Upload monarch-nav-theme.sppkg
# 4. Deploy to sites
```

### 3. CI/CD Pipeline
Example GitHub Actions workflow:

```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm ci
      - run: gulp clean
      - run: gulp bundle --ship
      - run: gulp package-solution --ship
      - uses: actions/upload-artifact@v2
        with:
          name: sppkg
          path: sharepoint/solution/*.sppkg
```

## Extending the Project

### 1. Adding Custom Navigation Types

Example: Adding mega menu support:

```typescript
// 1. Extend interfaces
interface INavigationItem {
  name: string;
  description: string;
  link: string;
  children?: INavigationItem[];
  // New properties
  type?: 'standard' | 'mega';
  columns?: number;
  featured?: boolean;
}

// 2. Update form component
const NavigationItemForm = () => {
  return (
    <div>
      {/* Existing fields */}
      <select
        value={formData.type || 'standard'}
        onChange={(e) => onFieldChange('type', e.target.value)}
      >
        <option value="standard">Standard</option>
        <option value="mega">Mega Menu</option>
      </select>
      
      {formData.type === 'mega' && (
        <input
          type="number"
          placeholder="Columns"
          value={formData.columns || 3}
          onChange={(e) => onFieldChange('columns', parseInt(e.target.value))}
        />
      )}
    </div>
  );
};

// 3. Update rendering logic
const renderMegaMenu = (item: INavigationItem) => {
  if (item.type === 'mega') {
    return (
      <div className="mega-menu" style={{ columns: item.columns }}>
        {item.children?.map(child => (
          <div key={child.name} className="mega-menu-item">
            {/* Mega menu item rendering */}
          </div>
        ))}
      </div>
    );
  }
  return renderStandardDropdown(item);
};
```

### 2. Adding Analytics Integration

```typescript
// 1. Create analytics service
export class AnalyticsService {
  public static trackNavigation(item: INavigationItem): void {
    // Send analytics data
    gtag('event', 'navigation_click', {
      'custom_parameter': item.name
    });
  }
  
  public static trackConfigChange(property: string, value: unknown): void {
    // Track configuration changes
  }
}

// 2. Integrate in Container component
const handleNavItemClick = (item: INavigationItem) => {
  AnalyticsService.trackNavigation(item);
  // Navigate to item.link
};
```

### 3. Adding Multi-Language Support

```typescript
// 1. Extend localization
interface ILocalizedNavigationItem {
  name: Record<string, string>;
  description: Record<string, string>;
  link: string;
}

// 2. Create localization hook
const useLocalization = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en-us');
  
  const getString = (key: string | Record<string, string>): string => {
    if (typeof key === 'string') return key;
    return key[currentLanguage] || key['en-us'] || '';
  };
  
  return { getString, currentLanguage, setCurrentLanguage };
};

// 3. Use in components
const NavigationItem = ({ item }: { item: ILocalizedNavigationItem }) => {
  const { getString } = useLocalization();
  
  return (
    <div>
      <span>{getString(item.name)}</span>
      <span>{getString(item.description)}</span>
    </div>
  );
};
```

### 4. Adding Custom Themes

```typescript
// 1. Create theme system
interface IThemeDefinition {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

const predefinedThemes: IThemeDefinition[] = [
  {
    name: 'Corporate Blue',
    backgroundColor: '#0078d4',
    textColor: '#ffffff',
    accentColor: '#106ebe',
    fontFamily: 'Segoe UI'
  },
  // More themes...
];

// 2. Add theme selector to ThemeModal
const ThemeSelector = ({ onThemeSelect }: { onThemeSelect: (theme: IThemeDefinition) => void }) => {
  return (
    <div>
      <h3>Predefined Themes</h3>
      {predefinedThemes.map(theme => (
        <button
          key={theme.name}
          onClick={() => onThemeSelect(theme)}
          style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
};
```

### 5. Performance Optimization

```typescript
// 1. Implement lazy loading
const ThemeModal = React.lazy(() => import('./ThemeModal'));
const NavModal = React.lazy(() => import('./NavModal'));

// 2. Use in Container
const Container = () => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {isThemeModalOpen && (
        <ThemeModal {...themeModalProps} />
      )}
      {isNavModalOpen && (
        <NavModal {...navModalProps} />
      )}
    </React.Suspense>
  );
};

// 3. Implement memoization
const NavigationItem = React.memo(({ item }: { item: INavigationItem }) => {
  return <div>{item.name}</div>;
});

// 4. Optimize state updates
const useOptimizedConfig = () => {
  const [config, setConfig] = useState<IMonarchNavConfig>();
  
  const updateTheme = useCallback((key: string, value: unknown) => {
    setConfig(prev => ({
      ...prev,
      themes: {
        ...prev.themes,
        [key]: value
      }
    }));
  }, []);
  
  return { config, updateTheme };
};
```

## Best Practices

### 1. Code Organization
- Keep components small and focused
- Use custom hooks for complex logic
- Separate business logic from UI components
- Create reusable utility functions

### 2. Performance
- Use React.memo for expensive components
- Implement lazy loading for modals
- Debounce user input
- Optimize bundle size

### 3. Accessibility
- Use semantic HTML elements
- Implement ARIA attributes
- Support keyboard navigation
- Test with screen readers

### 4. Error Handling
- Implement proper error boundaries
- Show user-friendly error messages
- Log errors for debugging
- Provide fallback UI states

### 5. Testing
- Write unit tests for utilities
- Test component behavior
- Mock external dependencies
- Use integration tests for workflows

---

## Contributing

When contributing to MonarchNav:

1. Follow the established code style
2. Add tests for new features
3. Update documentation
4. Test in multiple browsers
5. Ensure accessibility compliance

For questions or support, refer to the SharePoint Framework documentation or contact the development team.
