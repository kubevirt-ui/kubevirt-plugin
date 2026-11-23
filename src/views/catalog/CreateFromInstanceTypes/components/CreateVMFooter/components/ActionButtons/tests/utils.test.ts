import { instanceTypeVMStoreInitialState } from '@catalog/CreateFromInstanceTypes/state/utils/state';
import { InstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/utils/types';

import { getDisableButtonTooltipContent } from '../utils';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  t: (key: string) => key,
  useKubevirtTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@kubevirt-utils/components/VMNameValidationHelperText/utils/utils', () => ({
  isValidVMName: () => true,
}));

const buildStore = (selectedInstanceType: { name: string; namespace: null | string }) =>
  ({
    ...instanceTypeVMStoreInitialState,
    instanceTypeVMState: {
      ...instanceTypeVMStoreInitialState.instanceTypeVMState,
      selectedBootableVolume: { metadata: { name: 'rhel9' } },
      selectedInstanceType,
      vmName: 'my-vm',
    },
  } as unknown as InstanceTypeVMStore);

const INSTANCE_TYPE_REQUIRED = 'An InstanceType must be selected';

describe('getDisableButtonTooltipContent', () => {
  it('requires an instance type when the selected instance type name is empty', () => {
    expect(
      getDisableButtonTooltipContent(buildStore({ name: '', namespace: null }), true, false),
    ).toBe(INSTANCE_TYPE_REQUIRED);
  });

  it('requires an instance type when the selected instance type is missing', () => {
    expect(
      getDisableButtonTooltipContent(
        buildStore(undefined as unknown as { name: string; namespace: null }),
        true,
        false,
      ),
    ).toBe(INSTANCE_TYPE_REQUIRED);
  });

  it('returns no tooltip when an instance type is selected and the user can create', () => {
    expect(
      getDisableButtonTooltipContent(
        buildStore({ name: 'u1.medium', namespace: null }),
        true,
        false,
      ),
    ).toBeUndefined();
  });
});
