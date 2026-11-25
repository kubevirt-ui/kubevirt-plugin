import React, { type ReactNode } from 'react';

import { type V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { fireEvent, render, screen } from '@testing-library/react';

import FamilyAvailabilitySection from './FamilyAvailabilitySection';

const HUB = 'local-cluster';

const mockedUseFleetAccessReview = jest.mocked(useFleetAccessReview);

// release-5.0's default Jest translation mock does not interpolate {{placeholders}}.
jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => {
  const t = (key: string, options?: Record<string, unknown>): string =>
    Object.entries(options ?? {}).reduce(
      (text, [name, value]) => text.split(`{{${name}}}`).join(String(value)),
      key,
    );
  return { __esModule: true, useKubevirtTranslation: () => ({ t }) };
});

jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@multicluster/useIsACMPage', () => jest.fn());
jest.mock('@multicluster/hooks/useK8sWatchData', () => jest.fn());
jest.mock('@multicluster/k8sRequests', () => ({ kubevirtK8sPatch: jest.fn() }));
jest.mock('@kubevirt-utils/hooks/useClusterInstanceTypes', () => jest.fn());
jest.mock('@kubevirt-utils/hooks/useKubevirtToast', () => ({
  __esModule: true,
  default: () => ({ addDangerToast: jest.fn() }),
}));
jest.mock('@settings/ExpandSection/hooks/useIsExpandedAndHighlighted', () => ({
  __esModule: true,
  default: () => ({ isExpanded: true, isHighlighted: false, setIsExpanded: jest.fn() }),
}));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ kind: 'ConfigMap', version: 'v1' })),
}));
jest.mock('@stolostron/multicluster-sdk', () => ({
  useFleetAccessReview: jest.fn(),
  useHubClusterName: jest.fn(() => ['local-cluster', true, undefined]),
}));
jest.mock('@kubevirt-utils/components/ClusterProjectDropdown/ClusterDropdown', () => ({
  __esModule: true,
  default: ({
    onChange,
    selectedCluster,
  }: {
    onChange: (cluster: string) => void;
    selectedCluster: string;
  }): ReactNode => (
    <select
      aria-label="cluster-dropdown"
      onChange={(event) => onChange(event.target.value)}
      value={selectedCluster}
    >
      {['local-cluster', 'spoke-a', 'spoke-b'].map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  ),
}));

const SERIES = ['u1', 'm1', 'cx1', 'd1', 'n1', 'o1', 'rt1'];
const instanceTypes = SERIES.map((series) => ({
  metadata: {
    annotations: { 'instancetype.kubevirt.io/displayName': series.toUpperCase() },
    labels: {
      'instancetype.kubevirt.io/class': series,
      'instancetype.kubevirt.io/vendor': 'kubevirt.io',
    },
    name: `${series}.large`,
  },
  spec: { cpu: { guest: 2 }, memory: { guest: '4Gi' } },
})) as unknown as V1beta1VirtualMachineClusterInstancetype[];

const DISABLED_BY_CLUSTER: Record<string, string> = {
  'spoke-a': '["m1","o1"]',
  'spoke-b': '["rt1"]',
};

const configMapFor = (cluster?: string) => ({
  data: { disabledInstanceTypeFamilies: DISABLED_BY_CLUSTER[cluster ?? ''] ?? '[]' },
  metadata: { name: 'kubevirt-ui-features', resourceVersion: '1' },
});

describe('FamilyAvailabilitySection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    operatorNamespaceSignal.value = 'openshift-cnv';
    mockedUseFleetAccessReview.mockImplementation((({ cluster }: { cluster?: string }) => [
      cluster !== 'spoke-b',
      false,
    ]) as never);
    jest.mocked(useClusterInstanceTypes).mockReturnValue([instanceTypes, true, undefined]);
    jest
      .mocked(useK8sWatchData)
      .mockImplementation(
        (resource) =>
          [
            configMapFor((resource as { cluster?: string } | null)?.cluster),
            true,
            undefined,
          ] as ReturnType<typeof useK8sWatchData>,
      );
  });

  describe('visibility gated on ConfigMap patch permission', () => {
    beforeEach(() => {
      jest.mocked(useIsACMPage).mockReturnValue(false);
      jest.mocked(useClusterParam).mockReturnValue(undefined);
    });

    it('standalone: renders the section when the user can patch the features ConfigMap', () => {
      render(<FamilyAvailabilitySection />);

      expect(screen.getByText('Family availability')).toBeInTheDocument();
      expect(screen.getAllByRole('switch')).toHaveLength(7);
    });

    it('standalone: renders nothing when the user cannot patch the features ConfigMap', () => {
      mockedUseFleetAccessReview.mockReturnValue([false, false]);

      const { container } = render(<FamilyAvailabilitySection />);

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });

    it('standalone: renders nothing while the access review is still loading', () => {
      mockedUseFleetAccessReview.mockReturnValue([true, true]);

      const { container } = render(<FamilyAvailabilitySection />);

      expect(container).toBeEmptyDOMElement();
    });

    it('standalone: renders nothing while the operator namespace is unknown', () => {
      operatorNamespaceSignal.value = undefined;

      const { container } = render(<FamilyAvailabilitySection />);

      expect(container).toBeEmptyDOMElement();
    });

    it('ACM: renders nothing when the user cannot patch the ConfigMap on the default cluster', () => {
      jest.mocked(useIsACMPage).mockReturnValue(true);
      mockedUseFleetAccessReview.mockReturnValue([false, false]);

      const { container } = render(<FamilyAvailabilitySection />);

      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByLabelText('cluster-dropdown')).not.toBeInTheDocument();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    });
  });

  it('ACM single-cluster route: shows the dropdown defaulted to the URL cluster', () => {
    jest.mocked(useIsACMPage).mockReturnValue(true);
    jest.mocked(useClusterParam).mockReturnValue('spoke-a');

    render(<FamilyAvailabilitySection />);

    expect(screen.getByLabelText('cluster-dropdown')).toHaveValue('spoke-a');
    expect(screen.queryByText('Cluster: spoke-a')).not.toBeInTheDocument();
    expect(screen.getByText('5 / 7 available on spoke-a')).toBeInTheDocument();
  });

  describe('ACM All clusters', () => {
    beforeEach(() => {
      jest.mocked(useIsACMPage).mockReturnValue(true);
      jest.mocked(useClusterParam).mockReturnValue(undefined);
    });

    it('defaults to the hub cluster with the selected-cluster help text', () => {
      render(<FamilyAvailabilitySection />);

      expect(screen.getByLabelText('cluster-dropdown')).toHaveValue(HUB);
      expect(
        screen.getByText(/Hide instance type families that the selected cluster cannot run/),
      ).toBeInTheDocument();
      expect(screen.queryByText(/available on/)).not.toBeInTheDocument();
      expect(screen.getAllByRole('switch')).toHaveLength(7);
      expect(useClusterInstanceTypes).toHaveBeenLastCalledWith(undefined, undefined, HUB);
    });

    it('switching to spoke-a updates the badge and the card state', () => {
      render(<FamilyAvailabilitySection />);

      fireEvent.change(screen.getByLabelText('cluster-dropdown'), {
        target: { value: 'spoke-a' },
      });

      expect(screen.getByText('5 / 7 available on spoke-a')).toBeInTheDocument();
      expect(useClusterInstanceTypes).toHaveBeenLastCalledWith(undefined, undefined, 'spoke-a');
      expect(screen.getByRole('switch', { name: 'Toggle availability for M1' })).not.toBeChecked();
      expect(screen.getByRole('switch', { name: 'Toggle availability for U1' })).toBeChecked();
      expect(screen.getByRole('switch', { name: 'Toggle availability for U1' })).toBeEnabled();
    });

    it('switching to a cluster without patch permission hides all families but keeps the selector', () => {
      render(<FamilyAvailabilitySection />);

      fireEvent.change(screen.getByLabelText('cluster-dropdown'), {
        target: { value: 'spoke-b' },
      });

      expect(
        screen.getByText(
          'You do not have permission to change instance type family availability on cluster spoke-b.',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole('switch')).not.toBeInTheDocument();
      expect(screen.queryByText(/available on/)).not.toBeInTheDocument();
      expect(screen.getByLabelText('cluster-dropdown')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('cluster-dropdown'), {
        target: { value: 'spoke-a' },
      });

      expect(screen.getAllByRole('switch')).toHaveLength(7);
    });
  });
});
