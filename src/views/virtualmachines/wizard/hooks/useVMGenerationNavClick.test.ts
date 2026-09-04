import { type WizardStepType } from '@patternfly/react-core';
import { act, renderHook } from '@testing-library/react';
import { VMCreationMethod, VMWizardStep } from '@virtualmachines/wizard/utils/constants';

import useVMGenerationNavClick from './useVMGenerationNavClick';

const createVMFromTemplate = jest.fn();
let mockIsTemplateGenerationInProgress = false;

jest.mock(
  '@virtualmachines/wizard/state/template-vm-generation-context/TemplateVMGenerationProvider',
  () => ({
    useTemplateVMGeneration: () => ({
      createVMFromTemplate,
      isProcessing: mockIsTemplateGenerationInProgress,
    }),
  }),
);

const createStep = (id: VMWizardStep, index: number): WizardStepType => ({ id, index, name: id });

describe('useVMGenerationNavClick', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createVMFromTemplate.mockResolvedValue(true);
    mockIsTemplateGenerationInProgress = false;
  });

  it('ensures an instance-type VM exists before navigating to customization', async () => {
    const ensureGeneratedVM = jest.fn(() => true);
    const goToStepByIndex = jest.fn();
    const { result } = renderHook(() =>
      useVMGenerationNavClick(VMCreationMethod.INSTANCE_TYPE, ensureGeneratedVM),
    );

    await act(() =>
      result.current.handleNavItemClick(createStep(VMWizardStep.CUSTOMIZATION, 5), goToStepByIndex),
    );

    expect(ensureGeneratedVM).toHaveBeenCalledTimes(1);
    expect(goToStepByIndex).toHaveBeenCalledWith(5);
  });

  it('does not navigate when the instance-type VM cannot be generated', async () => {
    const ensureGeneratedVM = jest.fn(() => false);
    const goToStepByIndex = jest.fn();
    const { result } = renderHook(() =>
      useVMGenerationNavClick(VMCreationMethod.INSTANCE_TYPE, ensureGeneratedVM),
    );

    await act(() =>
      result.current.handleNavItemClick(
        createStep(VMWizardStep.REVIEW_AND_CREATE, 6),
        goToStepByIndex,
      ),
    );

    expect(goToStepByIndex).not.toHaveBeenCalled();
  });

  it('does not generate a VM when navigating to an earlier step', async () => {
    const ensureGeneratedVM = jest.fn(() => true);
    const goToStepByIndex = jest.fn();
    const { result } = renderHook(() =>
      useVMGenerationNavClick(VMCreationMethod.INSTANCE_TYPE, ensureGeneratedVM),
    );

    await act(() =>
      result.current.handleNavItemClick(createStep(VMWizardStep.BOOT_SOURCE, 3), goToStepByIndex),
    );

    expect(ensureGeneratedVM).not.toHaveBeenCalled();
    expect(goToStepByIndex).toHaveBeenCalledWith(3);
  });

  it('does not navigate when template generation fails', async () => {
    createVMFromTemplate.mockResolvedValue(false);
    const goToStepByIndex = jest.fn();
    const { result } = renderHook(() =>
      useVMGenerationNavClick(
        VMCreationMethod.TEMPLATE,
        jest.fn(() => true),
      ),
    );

    await act(() =>
      result.current.handleNavItemClick(createStep(VMWizardStep.CUSTOMIZATION, 3), goToStepByIndex),
    );

    expect(goToStepByIndex).not.toHaveBeenCalled();
  });

  it.each([
    [VMCreationMethod.INSTANCE_TYPE, false],
    [VMCreationMethod.TEMPLATE, true],
    [VMCreationMethod.CLONE, false],
  ])(
    'reports shared template processing for the template flow only when using %s',
    (creationMethod, expectedIsGeneratingVM) => {
      mockIsTemplateGenerationInProgress = true;

      const { result } = renderHook(() =>
        useVMGenerationNavClick(
          creationMethod,
          jest.fn(() => true),
        ),
      );

      expect(result.current.isGeneratingVM).toBe(expectedIsGeneratingVM);
    },
  );
});
