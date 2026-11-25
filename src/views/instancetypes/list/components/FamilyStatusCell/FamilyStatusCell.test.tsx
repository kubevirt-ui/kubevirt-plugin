import React from 'react';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { render, screen } from '@testing-library/react';

import FamilyStatusCell from './FamilyStatusCell';

jest.mock('@multicluster/hooks/useK8sWatchData', () => jest.fn());
jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@stolostron/multicluster-sdk', () => ({ useFleetAccessReview: jest.fn() }));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ kind: 'ConfigMap', version: 'v1' })),
}));

const makeRow = (name: string, cluster?: string, vendor = 'kubevirt.io') =>
  ({
    cluster,
    metadata: { labels: { 'instancetype.kubevirt.io/vendor': vendor }, name },
  }) as unknown as V1beta1VirtualMachineClusterInstancetype;

const DISABLED: Record<string, string> = {
  'local-cluster': '[]',
  'spoke-a': '["m1"]',
};

describe('FamilyStatusCell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    operatorNamespaceSignal.value = 'openshift-cnv';
    jest.mocked(useFleetAccessReview).mockReturnValue([true, false] as never);
    jest.mocked(useK8sWatchData).mockImplementation((resource) => {
      const cluster = (resource as { cluster?: string } | null)?.cluster ?? '';
      return [
        { data: { disabledInstanceTypeFamilies: DISABLED[cluster] ?? '[]' } },
        true,
        undefined,
      ] as ReturnType<typeof useK8sWatchData>;
    });
  });

  it("reflects each row's own cluster ConfigMap", () => {
    render(
      <>
        <div data-test-id="hub">
          <FamilyStatusCell row={makeRow('m1.large', 'local-cluster')} />
        </div>
        <div data-test-id="spoke">
          <FamilyStatusCell row={makeRow('m1.large', 'spoke-a')} />
        </div>
      </>,
    );

    expect(screen.getByTestId('hub')).toHaveTextContent('Shown in selectors');
    expect(screen.getByTestId('spoke')).toHaveTextContent('Hidden from selectors');
    expect(useK8sWatchData).toHaveBeenCalledWith(
      expect.objectContaining({ cluster: 'local-cluster' }),
    );
    expect(useK8sWatchData).toHaveBeenCalledWith(expect.objectContaining({ cluster: 'spoke-a' }));
  });

  it("reviews patch access on the ConfigMap of the row's own cluster", () => {
    render(<FamilyStatusCell row={makeRow('m1.large', 'spoke-a')} />);

    expect(useFleetAccessReview).toHaveBeenCalledWith(
      expect.objectContaining({
        cluster: 'spoke-a',
        name: 'kubevirt-ui-features',
        namespace: 'openshift-cnv',
        verb: 'patch',
      }),
    );
  });

  describe('without permission to patch the features ConfigMap', () => {
    it('shows no family status and does not watch the ConfigMap when the user cannot patch', () => {
      jest.mocked(useFleetAccessReview).mockReturnValue([false, false] as never);

      render(<FamilyStatusCell row={makeRow('m1.large', 'spoke-a')} />);

      expect(screen.queryByText('Shown in selectors')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden from selectors')).not.toBeInTheDocument();
      expect(screen.getByText('—')).toBeInTheDocument();
      expect(useK8sWatchData).not.toHaveBeenCalled();
    });

    it('shows no family status while the access review is loading', () => {
      jest.mocked(useFleetAccessReview).mockReturnValue([true, true] as never);

      render(<FamilyStatusCell row={makeRow('m1.large', 'spoke-a')} />);

      expect(screen.queryByText('Shown in selectors')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden from selectors')).not.toBeInTheDocument();
      expect(screen.queryByText('—')).not.toBeInTheDocument();
      expect(useK8sWatchData).not.toHaveBeenCalled();
    });

    it('gates each row on its own cluster', () => {
      jest
        .mocked(useFleetAccessReview)
        .mockImplementation((({ cluster }: { cluster?: string }) => [
          cluster !== 'spoke-a',
          false,
        ]) as never);

      render(
        <>
          <div data-test-id="hub">
            <FamilyStatusCell row={makeRow('m1.large', 'local-cluster')} />
          </div>
          <div data-test-id="spoke">
            <FamilyStatusCell row={makeRow('m1.large', 'spoke-a')} />
          </div>
        </>,
      );

      expect(screen.getByTestId('hub')).toHaveTextContent('Shown in selectors');
      expect(screen.getByTestId('spoke')).not.toHaveTextContent('selectors');
    });
  });

  it('renders a dash for non Red Hat instance types', () => {
    render(<FamilyStatusCell row={makeRow('custom.large', 'spoke-a', 'example.com')} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders a skeleton while the ConfigMap is loading', () => {
    jest
      .mocked(useK8sWatchData)
      .mockReturnValue([undefined, false, undefined] as ReturnType<typeof useK8sWatchData>);

    render(<FamilyStatusCell row={makeRow('m1.large', 'spoke-a')} />);

    expect(screen.queryByText('Shown in selectors')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden from selectors')).not.toBeInTheDocument();
    expect(screen.queryByText('—')).not.toBeInTheDocument();
  });
});
