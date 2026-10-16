/** Gallery: avoid MemoryRouter navigating off the wizard scene when cancel/close runs. */
const useCloseWizard = (): (() => void) => () => {};

export default useCloseWizard;
