type UseCreateVMFromTemplate = () => {
  createVMFromTemplate: () => Promise<boolean>;
};

const useCreateVMFromTemplate: UseCreateVMFromTemplate = () => ({
  createVMFromTemplate: async () => true,
});

export default useCreateVMFromTemplate;
