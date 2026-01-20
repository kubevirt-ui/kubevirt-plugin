# KubeVirt UI Plugin - AI Assistant Guide

This document provides essential context for AI assistants working with the KubeVirt UI codebase. It complements the existing documentation (`README.md`, `CODING_STANDARDS.md`) and helps quickly understand the project structure, patterns, and conventions.

## Project Overview

The **KubeVirt Plugin** is a dynamic plugin for the OpenShift Console that provides a comprehensive UI for managing virtual machines and related resources in Kubernetes. It extends the OpenShift Console with virtualization capabilities, allowing users to create, manage, and monitor virtual machines through a web interface.

### Technology Stack

- **React**: 17.0.2 (functional components with hooks)
- **TypeScript**: 5.7.x (strict typing, prefer `type` over `interface`)
- **PatternFly React**: 6.2.x (UI component library)
- **OpenShift Console Dynamic Plugin SDK**: 4.20.0 (plugin framework)
- **React Router**: v5.3.x (with v6 compat layer via `react-router-dom-v5-compat`)
- **React Hook Form**: 7.31.2 (form management)
- **Zustand**: 4.3.7 (state management)
- **React i18next**: 11.18.6 (internationalization)
- **Webpack**: 5.96.1 (bundling)
- **Cypress**: 14.3.x (E2E testing)
- **Jest**: 29.7.0 (unit testing)

### Repository Structure

This is a monorepo containing multiple packages:

- `kubevirt-plugin/` - Main plugin code (this directory)
- `kubevirt-api/` - Generated API client libraries
- `kubevirt-components/` - Shared React components library
- `kubevirt-apiserver-proxy/` - Go proxy server for API requests

## Project Structure

### Key Directories

```
kubevirt-plugin/
├── src/
│   ├── views/              # Main feature views (catalog, VMs, templates, etc.)
│   ├── utils/              # Shared utilities, components, hooks, resources
│   ├── multicluster/       # Multi-cluster functionality
│   ├── perspective/        # Console perspective definitions
│   ├── extensions/         # Console extension definitions
│   └── templates/          # YAML templates for resources
├── cypress/                # E2E tests
├── locales/                # i18n translation files
├── plugin-metadata.ts      # Plugin build metadata
└── plugin-extensions.ts    # Console extension registrations
```

### Views Directory (`src/views/`)

Contains the main feature implementations:

- `catalog/` - VM creation catalog and wizard (238 files)
- `virtualmachines/` - Virtual machine management (381 files)
- `virtualmachinesinstance/` - VM instance views
- `templates/` - VM template management
- `clusteroverview/` - Cluster overview dashboard
- `instancetypes/` - Instance type management
- `migrationpolicies/` - Migration policy management
- `topology/` - Topology visualization
- `checkups/` - Health checkups
- `datasources/` - Data source management
- `bootablevolumes/` - Bootable volume management
- `search/` - Search functionality
- `lightspeed/` - AI-assisted features

### Utils Directory (`src/utils/`)

Shared utilities organized by type:

- `components/` - Reusable React components (687 files)
- `hooks/` - Custom React hooks (110 files)
- `resources/` - K8s resource utilities (118 files)
- `constants/` - Application constants
- `store/` - Zustand state stores
- `extensions/` - Console extension utilities
- `flags/` - Feature flag utilities
- `types/` - TypeScript type definitions
- `utils/` - General utility functions

### Other Key Directories

- `src/multicluster/` - Multi-cluster and ACM (Advanced Cluster Management) integration
- `src/perspective/` - Virtualization perspective definition
- `src/templates/` - YAML templates for creating resources
- `src/extensions/` - Additional console extensions

## TypeScript Path Aliases

The project uses path aliases defined in `tsconfig.json` for cleaner imports:

```typescript
"@catalog/*"                    → "src/views/catalog/*"
"@kubevirt-utils"               → "src/utils"
"@kubevirt-utils/*"             → "src/utils/*"
"@kubevirt-extensions/*"        → "src/extensions/*"
"@multicluster/*"               → "src/multicluster/*"
"@virtualmachines/*"            → "src/views/virtualmachines/*"
"@overview/*"                   → "src/views/clusteroverview/*"
"@topology/*"                   → "src/views/topology/*"
"@search/*"                     → "src/views/search/*"
"@lightspeed/*"                 → "src/views/lightspeed/*"
"@images/*"                     → "./images/*"
```

### Example Usage

```typescript
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Catalog } from '@catalog/Catalog';
import ClusterProjectDropdown from '@kubevirt-utils/components/ClusterProjectDropdown/ClusterProjectDropdown';
```

## Key Patterns and Conventions

### Component Structure

- **File Extensions**: `.tsx` for components, `.ts` for logic/utilities
- **Naming**: PascalCase for components (e.g., `HeaderTop.tsx`)
- **One Component Per File**: No nested components
- **Default Exports**: Use default exports for components
- **Functional Components**: Prefer functional components with hooks over class components

### Folder Organization

- **Folder Naming**: lowercase, kebab-case (e.g., `/components/main-header/`)
- **Component Structure**:
  ```
  /components/my-component/
  ├── components/      # Sub-components
  ├── utils/          # Component-specific utilities
  └── hooks/          # Component-specific hooks
  ```

### Styling

- **SCSS Files**: Extract styles into separate `.scss` files
- **BEM Methodology**: Use BEM for class naming
- **Project-Based Classes**: Use project-specific class names, don't rely on PatternFly class names
- **Avoid `!important`**: Only use when absolutely necessary
- **Responsive Design**: Prefer relative units (%, em, rem) over absolute (px)

### TypeScript Conventions

- **Prefer `type` over `interface`**: For defining object/function shapes
- **Avoid `any`**: Use `unknown` and narrow types as needed
- **Explicit Return Types**: Always define function return types explicitly
- **Export Types**: Add exported types to utility files

### Code Organization

- **Logic Separation**: Extract logic from components into custom hooks or utility files
- **File Length**: Keep files under 150 lines when possible
- **Function Length**: Functions should have a single responsibility
- **Comments**: Write self-explanatory code; use comments sparingly for unusual decisions

### Hooks Patterns

- **Dependencies**: Always specify dependencies in `useEffect` (use `[]` for no dependencies)
- **Logic Only**: Hooks should contain logic, not return JSX
- **Custom Hooks**: Extract reusable logic into custom hooks (easier to unit test)

### Example Component Structure

```typescript
import React, { FC } from 'react';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import './MyComponent.scss';

type MyComponentProps = {
  title: string;
  onAction: () => void;
};

const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  const { t } = useKubevirtTranslation();

  return (
    <div className="my-component">
      <h1>{title}</h1>
      <button onClick={onAction}>{t('Click me')}</button>
    </div>
  );
};

export default MyComponent;
```

## Important Libraries and Dependencies

### Core Dependencies

- **React 17.0.2** - UI framework
- **@patternfly/react-core** - UI component library
- **@openshift-console/dynamic-plugin-sdk** - Plugin framework
- **react-hook-form** - Form management
- **zustand** - State management
- **react-i18next** - Internationalization
- **react-router-dom** (v5) - Routing with v6 compat layer

### Key Utilities

- **@kubevirt-ui-ext/kubevirt-api** - Generated KubeVirt API client
- **axios** - HTTP client
- **js-yaml** - YAML parsing
- **date-fns** - Date utilities
- **lodash** - Utility functions
- **classnames** - Conditional class names

## Common Workflows

### VM Creation Flow

1. **Entry Point**: `src/views/catalog/Catalog.tsx`
2. **Wizard**: `src/views/catalog/wizard/Wizard.tsx`
3. **Context**: `src/views/catalog/utils/WizardVMContext.tsx`
4. **Steps**: Individual step components in `src/views/catalog/wizard/steps/`

### Component Development

1. Create component in appropriate directory (`src/utils/components/` for shared, `src/views/[feature]/components/` for feature-specific)
2. Create corresponding `.scss` file
3. Use `useKubevirtTranslation` for i18n
4. Extract logic to custom hooks if needed
5. Write tests (Cypress for E2E, Jest for unit)

### Internationalization

Use the `useKubevirtTranslation` hook:

```typescript
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

const MyComponent: FC = () => {
  const { t } = useKubevirtTranslation();
  return <h1>{t('Hello, World!')}</h1>;
};
```

For console extensions, use the format:
```json
{
  "name": "%plugin__kubevirt-plugin~My Label%"
}
```

Run `npm run i18n` to update translation files after adding/changing messages.

### Testing

- **E2E Tests**: Cypress tests in `cypress/tests/`
- **Unit Tests**: Jest tests alongside components
- **Test Commands**:
  - `npm run test` - Run Jest tests
  - `npm run test-cypress` - Open Cypress UI
  - `npm run test-cypress-headless` - Run Cypress headless

## Key Entry Points

### Plugin Entry

- **Plugin Metadata**: `plugin-metadata.ts` - Defines exposed modules and plugin configuration
- **Plugin Extensions**: `plugin-extensions.ts` - Registers console extensions (navigation, pages, actions, etc.)

### Main Views

- **Catalog**: `src/views/catalog/Catalog.tsx` - VM creation catalog
- **Virtual Machines**: `src/views/virtualmachines/` - VM list and details
- **Templates**: `src/views/templates/` - Template management
- **Cluster Overview**: `src/views/clusteroverview/ClusterOverviewPage.tsx` - Dashboard
- **Virtualization Landing**: `src/perspective/VirtualizationLandingPage.tsx` - Landing page

### Extensions

- **Multicluster**: `src/multicluster/extensions.ts`
- **Perspective**: `src/perspective/extensions.ts`
- **Utils**: `src/utils/extension.ts`
- **View-specific**: Each view directory may have its own `extensions.ts`

## Code Quality Standards

### Linting and Formatting

- **ESLint**: Configured with React, TypeScript, and import sorting plugins
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks with lint-staged
- **Commands**:
  - `npm run lint` - Check linting
  - `npm run lint:fix` - Auto-fix linting issues

### File Guidelines

- **File Length**: Under 150 lines when possible
- **Function Length**: Single responsibility, easily understood
- **Naming**: Descriptive names, avoid abbreviations

### Code Review

- No merges without review
- Smaller, dedicated PRs preferred
- Include PR description with links, Jira tickets, screenshots/videos

See `CODING_STANDARDS.md` for detailed guidelines.

## Development Context

### Local Development Setup

**Option 1 (Recommended)**: Two-terminal approach

1. **Terminal 1**: Run OpenShift Console
   ```bash
   oc login
   npm run start-console
   ```

2. **Terminal 2**: Run plugin
   ```bash
   npm ci && npm run dev
   ```

**Option 2**: Docker + VSCode Remote Container (see README.md)

**Option 3**: Manual Console setup (see README.md)

### Hot Reloading

- Webpack dev server provides hot module replacement
- Plugin runs on `http://localhost:9001`
- Console typically runs on `http://localhost:9000`

### Environment Variables

- `BRIDGE_BRANDING=openshift` - For OpenShift branding
- `PROXY_ENV=local` - When running `kubevirt-apiserver-proxy` locally

## Common Tasks Reference

### Finding Code

- **VM Creation**: `src/views/catalog/`
- **VM Management**: `src/views/virtualmachines/`
- **Utility Components**: `src/utils/components/`
- **Custom Hooks**: `src/utils/hooks/`
- **K8s Resources**: `src/utils/resources/`
- **Constants**: `src/utils/constants/`

### Adding New Views

1. Create directory in `src/views/[feature-name]/`
2. Create main component file
3. Add route in `plugin-extensions.ts`:
   ```typescript
   {
     properties: {
       component: { $codeRef: 'MyNewView' },
       path: ['/k8s/ns/:ns/my-feature'],
     },
     type: 'console.page/route',
   }
   ```
4. Export in `plugin-metadata.ts`:
   ```typescript
   MyNewView: './views/my-feature/MyNewView.tsx',
   ```

### Adding Console Extensions

1. Create extension definition in appropriate `extensions.ts` file
2. Import and add to main `plugin-extensions.ts` array
3. Export any required modules in `plugin-metadata.ts`

### Adding New Hooks

1. Create hook file in `src/utils/hooks/[hook-name]/`
2. Follow naming convention: `use[FeatureName].ts`
3. Export from `src/utils/hooks/index.ts` if shared
4. Use path alias: `@kubevirt-utils/hooks/[hook-name]`

## Additional Resources

- **README.md** - Setup, deployment, and general information
- **CODING_STANDARDS.md** - Detailed coding guidelines and best practices
- **INTERNATIONALIZATION.md** - i18n documentation
- **console-extensions.md** - Console extension API documentation (generated)

## Notes for AI Assistants

- Always use TypeScript path aliases for imports
- Follow the existing patterns in similar components
- Extract logic to hooks when components become complex
- Use `useKubevirtTranslation` for all user-facing strings
- Keep files focused and under 150 lines when possible
- Write self-explanatory code with minimal comments
- Check `CODING_STANDARDS.md` for specific guidelines
- Use functional components with hooks (avoid class components)
- Prefer `type` over `interface` for TypeScript definitions
