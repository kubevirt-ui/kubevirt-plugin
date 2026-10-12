/**
 * Centralized timeout constants for Playwright tests
 * Aligned with Playwright's global timeout (100 seconds / ~1.67 minutes)
 */

// Global timeout for folder operations (~1.67 minutes)
export const FOLDER_OPERATION_TIMEOUT = 100000;

// Global timeout for VM operations (~1.67 minutes)
export const VM_OPERATION_TIMEOUT = 100000;

// Global timeout for cluster operations (~1.67 minutes)
export const CLUSTER_OPERATION_TIMEOUT = 100000;

// Default timeout for general operations (~1.67 minutes)
export const DEFAULT_TIMEOUT = 100000;

// Network delay timeout for waiting after network requests (~0.67 seconds)
export const NETWORK_DELAY_TIMEOUT = 667;
