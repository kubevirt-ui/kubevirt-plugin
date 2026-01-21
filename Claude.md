# KubeVirt UI Plugin - AI Assistant Guide

This document provides essential context for AI assistants working with the KubeVirt UI codebase. It complements the existing documentation (`README.md`, `CODING_STANDARDS.md`) and helps quickly understand the project structure, patterns, and conventions.

## Project Overview

The **KubeVirt Plugin** is a dynamic plugin for the OpenShift Console that provides a comprehensive UI for managing virtual machines and related resources in Kubernetes. It extends the OpenShift Console with virtualization capabilities, allowing users to create, manage, and monitor virtual machines through a web interface.

### Technology Stack

Key technologies used (see `package.json` for current versions):

- **React** - UI framework (functional components with hooks)
- **TypeScript** - Strict typing (prefer `type` over `interface`)
- **PatternFly React** - UI component library
- **OpenShift Console Dynamic Plugin SDK** - Plugin framework (with fleet wrappers where needed)
- **React Router** - v5 with v6 compat layer (`react-router-dom-v5-compat`)
- **React Hook Form** - Form management
- **Zustand** - State management
- **React i18next** - Internationalization
- **Webpack** - Bundling
- **Cypress** - E2E testing
- **Jest** - Unit testing

## Project Structure

### Key Directories

```text
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
- `search/` - Advanced search (top bar in VirtualMachines list page)
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

- **Folder Naming**: Use lowercase, kebab-case (e.g., `/components/main-header/`) *(Per CNV UI Best Practices)*
- **Component Structure**:
  ```text
  /components/my-component/
  ├── components/      # Sub-components
  ├── utils/          # Component-specific utilities
  └── hooks/          # Component-specific hooks
  ```

### Styling

*Per CNV UI Best Practices document:*

- **Prefer SCSS**: Use SCSS for styling to leverage nesting, variables, and mixins for maintainable styles
- **Extract Styles**: Extract styling into SCSS files (`my-component-name.scss`) rather than embedding in components
- **Project-Based Classes**: Use project-specific class names as anchors; don't rely on PatternFly class names (they change between versions)
- **BEM Methodology**: Follow BEM for consistent and predictable class naming
- **Responsive Design**: Use relative units (%, em, rem) over absolute units (px)
- **Avoid `!important`**: Only use when absolutely necessary

### TypeScript Conventions

*Per CNV UI Best Practices document:*

- **Prefer `type` over `interface`**: For defining object/function shapes
- **Avoid `any`**: Use `unknown` and narrow types as needed
- **Explicit Return Types**: Always explicitly define return types for functions rather than relying on TypeScript to infer them
- **Export Types**: If a type is exported, add it to a utility file

### Function Development

*Per CNV UI Best Practices document:*

- **Keep functions short**: Focus on one action per function
- **Red → Green → Refactor**:
  1. Write a failing (**red**) solution
  2. Implement a working (**green**) solution
  3. Refactor for readability and performance
- **Descriptive Names**: Use descriptive names for variables, functions, and components. Avoid abbreviations unless widely recognized (e.g., use `fetchUserData` instead of `getData`)

### Code Organization

- **Logic Separation**: Extract logic from components into custom hooks or utility files (easier to unit test)
- **File Length**: Keep files under 150 lines when possible
- **Function Length**: Functions should have a single responsibility
- **Comments**: Write self-explanatory code; use comments sparingly for unusual decisions
- **Avoid Circular Dependencies**: Use index files cautiously to prevent circular dependencies *(Per CNV UI Best Practices)*

### Global/Store State

*Per CNV UI Best Practices document:*

- **Keep Minimal**: Keep the global state minimal and straightforward
- **PR Approval**: Obtain approval in the PR to add new values to prevent bloating

### Hooks Patterns

- **Dependencies**: Always specify dependencies in `useEffect` (use `[]` for no dependencies)
- **Logic Only**: Hooks should contain logic, not return JSX
- **Custom Hooks**: Extract reusable logic into custom hooks (easier to unit test)

### Performance Optimization

*Per CNV UI Best Practices document:*

- **Memoization**: Use React's memoization tools (`React.memo`, `useMemo`, `useCallback`) to avoid unnecessary re-renders
- **Lazy Loading**: Lazy load components with `React.lazy` and `Suspense`

### Constants

*Per CNV UI Best Practices document:*

- **Naming**: Define constants with uppercase and underscore-separated naming (e.g., `API_URL`)
- **Location**: Define constants in utility files
- **Avoid Magic Numbers**: Avoid hardcoded values and define them as constants for easy adjustments and readability

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
2. Create corresponding SCSS file for styles (`my-component-name.scss`)
3. Use `useKubevirtTranslation` for i18n
4. Extract logic to custom hooks if needed
5. Write unit tests with Jest

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

- **Unit Tests**: Jest tests alongside components (`npm run test`)
- **E2E Tests**: Cypress tests in `cypress/tests/`
  - **Note for AI Assistants**: E2E tests require a running OpenShift cluster with KubeVirt. Do not attempt to run Cypress tests without proper backend infrastructure.
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

*Per CNV UI Best Practices document:*

- **Peer Reviews**: Encourage peer code reviews to ensure consistency, catch errors, and improve code quality
- **No Merges Without Review**: All PRs must be reviewed before merging

### Version Control

*Per CNV UI Best Practices document:*

- **Meaningful Commits**: Use meaningful commit messages and avoid committing broken code
- **Commit Often**: Always commit often to ensure proper tracking of changes (can be squashed)
- **Smaller PRs**: Use smaller, dedicated PRs instead of one extensive PR - facilitates review, QE verification, and tracking
- **PR Description**: Add a main PR comment explaining referenced links, Jira, docs, use cases, and current/required state
- **Visual Changes**: When there are visual changes, add videos and/or screenshots

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

### Development Ports

- Plugin runs on `http://localhost:9001`
- Console typically runs on `http://localhost:9000`

**Note for AI Assistants**: Local development requires access to an OpenShift cluster. Do not attempt to run the full development flow without proper cluster access.

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

## PR Template

*Per CNV UI Best Practices document:*

When creating a Pull Request, use this template:

```markdown
## 📝 Description

> Add a brief description

## 🔗 Links

> Add JIRA, Docs, and other PR/Issue links

## 👥 CC://

> @tag as needed

## 📹 Demo

> Please add a video or an image of the behavior/changes, preferably before and after
```

**PR Guidelines:**
- Keep your PR as small as possible
- Limit your PR to one type (feature, refactoring, CI, or bugfix)
- PRs that add new external dependencies might take longer to review

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
