import React, { createContext, type FC, type ReactNode, useContext } from 'react';

import useCreateVMFromTemplate from '@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate';

type TemplateVMGenerationContextValue = ReturnType<typeof useCreateVMFromTemplate>;

type TemplateVMGenerationProviderProps = {
  children?: ReactNode;
};

const TemplateVMGenerationContext = createContext<TemplateVMGenerationContextValue | null>(null);

const TemplateVMGenerationProvider: FC<TemplateVMGenerationProviderProps> = ({ children }) => {
  const templateVMGeneration = useCreateVMFromTemplate();

  return (
    <TemplateVMGenerationContext.Provider value={templateVMGeneration}>
      {children}
    </TemplateVMGenerationContext.Provider>
  );
};

export const useTemplateVMGeneration = (): TemplateVMGenerationContextValue => {
  const context = useContext(TemplateVMGenerationContext);

  if (!context) {
    throw new Error('useTemplateVMGeneration must be used within TemplateVMGenerationProvider');
  }

  return context;
};

export default TemplateVMGenerationProvider;
