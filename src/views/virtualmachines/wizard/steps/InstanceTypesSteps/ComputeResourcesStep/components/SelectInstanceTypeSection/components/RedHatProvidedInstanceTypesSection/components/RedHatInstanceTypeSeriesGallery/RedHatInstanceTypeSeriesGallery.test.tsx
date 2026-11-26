import React from 'react';

import { type RedHatInstanceTypeMetadata } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/types';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { useFleetAccessReview } from '@stolostron/multicluster-sdk';
import { render, screen } from '@testing-library/react';

import RedHatInstanceTypeSeriesGallery from './RedHatInstanceTypeSeriesGallery';

jest.mock('@multicluster/hooks/useK8sWatchData', () => jest.fn());
jest.mock('@multicluster/hooks/useClusterParam', () => jest.fn());
jest.mock('@multicluster/useIsACMPage', () => jest.fn(() => false));
jest.mock('@stolostron/multicluster-sdk', () => ({
  useFleetAccessReview: jest.fn(() => [true, false]),
}));
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ kind: 'ConfigMap', version: 'v1' })),
}));
jest.mock(
  '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/components/RedHatInstanceTypeSeriesGallery/components/RedHatSeriesMenuCard/RedHatSeriesMenuCard',
  () => ({
    __esModule: true,
    default: ({ rhSeriesItem }: { rhSeriesItem: { seriesName: string } }) => (
      <div data-test-id={`series-${rhSeriesItem.seriesName}`}>{rhSeriesItem.seriesName}</div>
    ),
  }),
);

const redHatMenuItems = {
  items: ['u1', 'm1', 'cx1'].map((seriesName) => ({
    classDisplayNameAnnotation: seriesName.toUpperCase(),
    classLabel: seriesName,
    seriesName,
    sizes: [],
  })),
} as unknown as RedHatInstanceTypeMetadata;

describe('RedHatInstanceTypeSeriesGallery target cluster', () => {
  beforeEach(() => {
    jest.mocked(useFleetAccessReview).mockReturnValue([true, false] as never);
    operatorNamespaceSignal.value = 'openshift-cnv';
    jest.mocked(useK8sWatchData).mockImplementation((resource) => {
      const cluster = (resource as { cluster?: string } | null)?.cluster;
      return [
        { data: { disabledInstanceTypeFamilies: cluster === 'spoke-a' ? '["m1"]' : '[]' } },
        true,
        undefined,
      ] as ReturnType<typeof useK8sWatchData>;
    });
  });

  it('hides a family disabled only on the target spoke cluster', () => {
    render(<RedHatInstanceTypeSeriesGallery cluster="spoke-a" redHatMenuItems={redHatMenuItems} />);

    expect(screen.queryByTestId('series-m1')).not.toBeInTheDocument();
    expect(screen.getByTestId('series-u1')).toBeInTheDocument();
    expect(screen.getByTestId('series-cx1')).toBeInTheDocument();
  });

  it('still shows the same family on the hub cluster', () => {
    render(
      <RedHatInstanceTypeSeriesGallery cluster="local-cluster" redHatMenuItems={redHatMenuItems} />,
    );

    expect(screen.getByTestId('series-m1')).toBeInTheDocument();
  });

  it('keeps a disabled family when it is the preserved family', () => {
    render(
      <RedHatInstanceTypeSeriesGallery
        cluster="spoke-a"
        preserveFamily="m1"
        redHatMenuItems={redHatMenuItems}
      />,
    );

    expect(screen.getByTestId('series-m1')).toBeInTheDocument();
  });

  describe('all families disabled', () => {
    beforeEach(() => {
      jest
        .mocked(useK8sWatchData)
        .mockImplementation(
          () =>
            [
              { data: { disabledInstanceTypeFamilies: '["u1","m1","cx1"]' } },
              true,
              undefined,
            ] as ReturnType<typeof useK8sWatchData>,
        );
    });

    it('shows the empty state and no series cards', () => {
      render(
        <RedHatInstanceTypeSeriesGallery cluster="spoke-a" redHatMenuItems={redHatMenuItems} />,
      );

      expect(screen.getByText('No compute resources available')).toBeInTheDocument();
      expect(screen.queryByTestId('series-u1')).not.toBeInTheDocument();
    });

    it('shows the manage-families CTA when the user can patch the features ConfigMap', () => {
      render(
        <RedHatInstanceTypeSeriesGallery cluster="spoke-a" redHatMenuItems={redHatMenuItems} />,
      );

      expect(
        screen.getByRole('button', { name: 'Manage family availability' }),
      ).toBeInTheDocument();
    });

    it('hides the manage-families CTA while the access review is still loading', () => {
      jest.mocked(useFleetAccessReview).mockReturnValue([true, true] as never);

      render(
        <RedHatInstanceTypeSeriesGallery cluster="spoke-a" redHatMenuItems={redHatMenuItems} />,
      );

      expect(screen.getByText('No compute resources available')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Manage family availability' }),
      ).not.toBeInTheDocument();
    });

    it('hides the manage-families CTA when the user cannot patch the features ConfigMap', () => {
      jest.mocked(useFleetAccessReview).mockReturnValue([false, false] as never);

      render(
        <RedHatInstanceTypeSeriesGallery cluster="spoke-a" redHatMenuItems={redHatMenuItems} />,
      );

      expect(screen.getByText('No compute resources available')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Manage family availability' }),
      ).not.toBeInTheDocument();
      expect(screen.getByText(/Contact your cluster administrator/)).toBeInTheDocument();
    });
  });
});
