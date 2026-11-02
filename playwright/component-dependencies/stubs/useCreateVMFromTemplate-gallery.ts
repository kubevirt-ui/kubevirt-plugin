/**
 * Gallery alias for `useCreateVMFromTemplate`.
 * No-op create: always resolves success so template flows can stay in the gallery.
 */

type UseCreateVMFromTemplate = () => {
  createVMFromTemplate: () => Promise<boolean>;
};

/** Stub that skips real template instantiation API calls. */
const useCreateVMFromTemplate: UseCreateVMFromTemplate = () => ({
  createVMFromTemplate: async () => true,
});

export default useCreateVMFromTemplate;
