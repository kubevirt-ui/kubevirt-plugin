import { signal } from '@preact/signals-react';

import { OnboardingPopoverKey } from './types';

// Tracks dismissed popover keys synchronously within the session so the chain
// can advance immediately without waiting for ConfigMap propagation.
// Note: .value must be reassigned (not mutated) to trigger signal reactivity.
export const dismissedPopoverKeysSignal = signal<Set<OnboardingPopoverKey>>(new Set());
