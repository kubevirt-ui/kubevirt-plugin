import React, { type FC, type ReactNode, useState } from 'react';

import { act, renderHook } from '@testing-library/react';

import TemplateVMGenerationProvider, {
  useTemplateVMGeneration,
} from './TemplateVMGenerationProvider';

let resolveTemplateGeneration: () => void = () => undefined;

jest.mock('@virtualmachines/wizard/steps/TemplateStep/hooks/useCreateVMFromTemplate', () => () => {
  const [isProcessing, setIsProcessing] = useState(false);

  return {
    createVMFromTemplate: async (): Promise<boolean> => {
      setIsProcessing(true);
      await new Promise<void>((resolve) => {
        resolveTemplateGeneration = resolve;
      });
      setIsProcessing(false);
      return true;
    },
    isProcessing,
  };
});

const TestWrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <TemplateVMGenerationProvider>{children}</TemplateVMGenerationProvider>
);

describe('TemplateVMGenerationProvider', () => {
  beforeEach(() => {
    resolveTemplateGeneration = () => undefined;
  });

  it('shares template generation state between consumers', async () => {
    const { result } = renderHook(
      () => ({
        firstConsumer: useTemplateVMGeneration(),
        secondConsumer: useTemplateVMGeneration(),
      }),
      { wrapper: TestWrapper },
    );
    const generationResults: Promise<boolean>[] = [];

    act(() => {
      generationResults.push(result.current.firstConsumer.createVMFromTemplate());
    });

    expect(result.current.secondConsumer.isProcessing).toBe(true);

    await act(async () => {
      resolveTemplateGeneration();
      await expect(generationResults[0]).resolves.toBe(true);
    });

    expect(result.current.secondConsumer.isProcessing).toBe(false);
  });

  it('requires consumers to be rendered within the provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      expect(() => renderHook(() => useTemplateVMGeneration())).toThrow(
        'useTemplateVMGeneration must be used within TemplateVMGenerationProvider',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
