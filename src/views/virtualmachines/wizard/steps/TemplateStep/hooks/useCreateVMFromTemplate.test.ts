import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type Template } from '@kubevirt-utils/resources/template';
import { customizeWizardVMSignal } from '@kubevirt-utils/signals/customizeWizardVMSignal';
import { act, renderHook } from '@testing-library/react';
import { type VMWizardFormValues } from '@virtualmachines/wizard/state/vm-wizard-form/types';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';
import {
  discardGeneratedVMDraft,
  markGeneratedVMDraftStale,
} from '@virtualmachines/wizard/utils/generatedVMDraft';

import useCreateVMFromTemplate from './useCreateVMFromTemplate';
import { resolveVMFromTemplate } from './utils';

const setValue = jest.fn();
const selectedTemplate: Template = {
  apiVersion: 'template.openshift.io/v1',
  kind: 'Template',
  metadata: { name: 'test-template', namespace: 'openshift' },
  objects: [],
  parameters: [],
};
const resolvedVM: V1VirtualMachine = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'test-vm', namespace: 'test-project' },
  spec: { template: { spec: { domain: { devices: {} } } } },
};
let currentVMData: VMWizardFormValues['vmData'];

const getValues = jest.fn((fieldName: string) => {
  if (fieldName === 'vmData') return currentVMData;
  if (fieldName === 'uiState.lastProcessedTemplateKey') return '';
  return undefined;
});

jest.mock('react-hook-form', () => ({
  useWatch: jest.fn(() => currentVMData.cluster),
}));
jest.mock('@kubevirt-utils/extensions/telemetry/telemetry', () => ({
  logTemplateFlowEvent: jest.fn(),
}));
jest.mock('@kubevirt-utils/extensions/telemetry/vm-creation', () => ({
  logVMCreationFailedFromTemplate: jest.fn(),
}));
jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({ t: (message: string) => message }),
}));
jest.mock('@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings', () => () => [
  {},
]);
jest.mock('@kubevirt-utils/resources/shared', () => ({
  getResourceKey: jest.fn(() => 'openshift/test-template'),
}));
jest.mock('@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext', () => ({
  useVMWizard: () => ({ control: {}, getValues, setValue }),
}));
jest.mock(
  '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalogDrawer/utils/utils',
  () => ({ getFirstUnfulfilledRequiredParameter: jest.fn(() => null) }),
);
jest.mock('./utils', () => ({
  getVMObjectFromTemplate: jest.fn(({ vm }) => vm),
  resolveVMFromTemplate: jest.fn(() => Promise.resolve(resolvedVM)),
}));

describe('useCreateVMFromTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    discardGeneratedVMDraft();
    currentVMData = {
      autoLabelsMerged: false,
      cluster: 'test-cluster',
      creationMethod: VMCreationMethod.TEMPLATE,
      description: '',
      folder: '',
      name: 'test-vm',
      project: 'test-project',
      selectedTemplate,
    };
  });

  it('does not publish a template result after the generated draft is invalidated', async () => {
    const { result } = renderHook(() => useCreateVMFromTemplate());

    await act(async () => {
      const createResult = result.current.createVMFromTemplate();
      discardGeneratedVMDraft();
      expect(await createResult).toBe(false);
    });

    expect(resolveVMFromTemplate).toHaveBeenCalledTimes(1);
    expect(customizeWizardVMSignal.value).toBeNull();
  });

  it('allows only the latest concurrent template request to publish its result', async () => {
    let resolveFirstRequest: (vm: V1VirtualMachine) => void = () => undefined;
    let resolveSecondRequest: (vm: V1VirtualMachine) => void = () => undefined;
    const firstPendingRequest = new Promise<V1VirtualMachine>((resolve) => {
      resolveFirstRequest = resolve;
    });
    const secondPendingRequest = new Promise<V1VirtualMachine>((resolve) => {
      resolveSecondRequest = resolve;
    });
    jest
      .mocked(resolveVMFromTemplate)
      .mockImplementationOnce(() => firstPendingRequest)
      .mockImplementationOnce(() => secondPendingRequest);
    const { result } = renderHook(() => useCreateVMFromTemplate());
    const requestResults: Promise<boolean>[] = [];

    act(() => {
      requestResults.push(result.current.createVMFromTemplate());
      requestResults.push(result.current.createVMFromTemplate());
    });

    await act(async () => {
      resolveSecondRequest(resolvedVM);
      await expect(requestResults[1]).resolves.toBe(true);
    });

    const customizedVM: V1VirtualMachine = {
      ...resolvedVM,
      metadata: { ...resolvedVM.metadata, labels: { keep: 'me' } },
    };
    customizeWizardVMSignal.value = customizedVM;

    await act(async () => {
      resolveFirstRequest(resolvedVM);
      await expect(requestResults[0]).resolves.toBe(false);
    });

    expect(customizeWizardVMSignal.value).toBe(customizedVM);
  });

  it('preserves unrelated customization when template inputs change', async () => {
    const { result } = renderHook(() => useCreateVMFromTemplate());

    await act(async () => expect(await result.current.createVMFromTemplate()).toBe(true));
    customizeWizardVMSignal.value = {
      ...resolvedVM,
      spec: {
        ...resolvedVM.spec,
        template: {
          ...resolvedVM.spec.template,
          spec: { ...resolvedVM.spec.template.spec, hostname: 'keep-me' },
        },
      },
    };
    currentVMData = {
      ...currentVMData,
      selectedTemplate: {
        ...selectedTemplate,
        parameters: [{ name: 'MEMORY', value: '4Gi' }],
      },
    };
    markGeneratedVMDraftStale();

    await act(async () => expect(await result.current.createVMFromTemplate()).toBe(true));

    expect(customizeWizardVMSignal.value.spec.template.spec.hostname).toBe('keep-me');
  });
});
