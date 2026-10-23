/**
 * Gallery alias for `useCloseWizard`.
 * No-op close handler so cancel/exit does not navigate away from the in-memory gallery route.
 */

/** Returns a no-op function for wizard close/cancel callbacks. */
const useCloseWizard = (): (() => void) => () => {};

export default useCloseWizard;
