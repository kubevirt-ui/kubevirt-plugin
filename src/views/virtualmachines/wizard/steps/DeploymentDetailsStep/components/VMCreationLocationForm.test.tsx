import { fireEvent, render, screen } from '@testing-library/react';
import { VMCreationMethod } from '@virtualmachines/wizard/utils/constants';

import VMCreationLocationForm from './VMCreationLocationForm';

const mockClearDraft = jest.fn();
const mockSetValue = jest.fn();
const mockValues: Record<string, unknown> = {
  creationMethod: VMCreationMethod.INSTANCE_TYPE,
  'deployment.cluster': 'cluster-a',
  'deployment.folder': '',
  'deployment.project': 'project-a',
};
const mockGetValues = jest.fn((path: string) => mockValues[path]);

jest.mock('react-hook-form', () => ({
  Controller: ({
    name,
    render: renderField,
  }: {
    name: string;
    render: (args: unknown) => unknown;
  }) =>
    renderField({
      field: {
        onChange: (value: unknown) => mockSetValue(name, value),
        ref: null,
        value: mockValues[name],
      },
    }),
  useWatch: () => ['cluster-a', '', 'project-a'],
}));
jest.mock('@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown', () =>
  jest.fn(({ onChange }) => (
    <button data-test-id="cluster" onClick={() => onChange('cluster-b')} type="button" />
  )),
);
jest.mock('@kubevirt-utils/components/ClusterProjectDropdown/NamespaceDropdown', () =>
  jest.fn(({ onChange }) => (
    <button data-test-id="project" onClick={() => onChange('project-b')} type="button" />
  )),
);
jest.mock('@kubevirt-utils/components/FolderSelect/FolderSelect', () => jest.fn(() => null));
jest.mock('@kubevirt-utils/components/HelpTextIcon/HelpTextIcon', () => jest.fn(() => null));
jest.mock('@kubevirt-utils/hooks/useFeatures/useFeatures', () => ({
  useFeatures: () => ({ featureEnabled: false, loading: false }),
}));
jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => ({
  useKubevirtTranslation: () => ({ t: (value: string) => value }),
}));
jest.mock('@multicluster/useIsACMPage', () => () => true);
jest.mock('@stolostron/multicluster-sdk', () => ({ useHubClusterName: () => ['hub'] }));
jest.mock('@virtualmachines/wizard/form/VMWizardFormProvider', () => ({
  useVMWizardForm: () => ({ control: {}, getValues: mockGetValues, setValue: mockSetValue }),
}));
jest.mock('@virtualmachines/wizard/hooks/useWizardVMDraft', () => ({
  useWizardVMDraft: () => ({ clearDraft: mockClearDraft }),
}));

describe('VMCreationLocationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValues.creationMethod = VMCreationMethod.INSTANCE_TYPE;
  });

  it('fully clears generated state when cluster or project changes', () => {
    render(<VMCreationLocationForm />);

    fireEvent.click(screen.getByTestId('cluster'));
    fireEvent.click(screen.getByTestId('project'));

    expect(mockClearDraft).toHaveBeenCalledTimes(2);
  });

  it('also clears the clone source when its location changes', () => {
    mockValues.creationMethod = VMCreationMethod.CLONE;
    render(<VMCreationLocationForm />);

    fireEvent.click(screen.getByTestId('project'));

    expect(mockSetValue).toHaveBeenCalledWith('clone.sourceVM', null, {
      shouldValidate: true,
    });
    expect(mockClearDraft).toHaveBeenCalledTimes(1);
  });
});
