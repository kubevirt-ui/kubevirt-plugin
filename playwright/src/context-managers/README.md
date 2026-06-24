# Context Managers

Type-safe state management for sharing data across page object method calls within a single test. The context manager is used internally by base classes — spec files rarely interact with it directly.

## Overview

**`ScenarioContextManager`** is a singleton that stores test data in a typed key-value store (`Map`). It allows page objects and clients to:

- Store resource information (names, namespaces, YAML) after creation
- Access previously stored values from other page object calls
- Access test configuration values set during global setup

## Architecture

### Type-Safe Context Keys

The context manager uses **type-safe enum keys** instead of raw strings for better autocomplete and refactoring safety.

### Files in this Directory

- **`scenario-context-manager.ts`** — Main singleton class that manages the key-value store
- **`context-keys.ts`** — Defines the `ContextKey` enum and type mappings for all standard context keys

## Usage

In practice, the context manager is available in page objects and clients via `BasePage` and `BaseClient`. Most spec files manage state via explicit variables, but the context manager is useful when:

- Coordinating VM name/namespace across multiple page object calls in a deeply nested flow
- Accessing `CONFIG_*` values written by global setup (e.g. `testNamespace`, `cnvNamespace`)

```typescript
import { ScenarioContextManager } from '@/context-managers/scenario-context-manager';
import { ContextKey } from '@/context-managers/context-keys';

// Read a value set during global setup
const ns = ScenarioContextManager.getInstance().get(ContextKey.CONFIG_TEST_NAMESPACE);

// Store a value for later use within the same test
ScenarioContextManager.getInstance().set(ContextKey.CURRENT_VM_NAME, vmName);
```

## Available Context Keys

### Configuration Keys (`CONFIG_*`)

Set from the test configuration file during global setup: test namespace, CNV namespace, secret information, etc.

### Resource Keys (`CURRENT_*`)

Store information about the resource currently under test: Virtual Machines, DataVolumes, Templates, Instance Types, Migration Policies.

### State Keys (`STATE_*`)

Temporary flags and values: authentication tokens, existence check results, log outputs.

## Best Practices

- Use `ContextKey` enum for all standard keys; never use raw strings
- In spec files, prefer explicit local variables over context keys — clearer and easier to reason about
- Clear context in test cleanup (the `cleanup` fixture handles this automatically)
- Check for `undefined` when reading values that may not have been set

## Related Documentation

- [Fixtures](../fixtures/README.md) — how `cleanup` fixture drains context after each test
- [Utils](../utils/README.md) — `TestConfigManager` populates `CONFIG_*` keys during setup
