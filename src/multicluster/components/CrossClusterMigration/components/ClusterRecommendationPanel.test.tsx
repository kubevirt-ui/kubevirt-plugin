import React from 'react';

import { render, screen } from '@testing-library/react';

import { MigrationTargetResponse } from '../hooks/useClusterRecommendationTypes';

import ClusterRecommendationPanel from './ClusterRecommendationPanel';

jest.mock('@kubevirt-utils/hooks/useKubevirtTranslation', () => {
  const t = (key: string, params?: Record<string, string>) => {
    let result = key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(`{{${k}}}`, String(v));
      });
    }
    return result;
  };
  return {
    t,
    useKubevirtTranslation: () => ({ t }),
  };
});

jest.mock('@kubevirt-utils/utils/humanize.js', () => ({
  humanizeBinaryBytes: (bytes: number) => ({
    string: `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GiB`,
  }),
}));

const mockData: MigrationTargetResponse = {
  candidates: [
    {
      availableCPUCores: 23.74,
      availableMemoryBytes: 107653811200,
      bestNode: 'node-1',
      cluster: 'cluster-a',
      cpuScore: 72,
      matchedStorageClasses: ['managed-csi'],
      memoryScore: 79,
      storageScore: 100,
      storageType: 'cloud',
      totalScore: 83,
    },
    {
      availableCPUCores: 10.5,
      availableMemoryBytes: 53826905600,
      bestNode: 'node-2',
      cluster: 'cluster-b',
      cpuScore: 50,
      matchedStorageClasses: ['standard'],
      memoryScore: 60,
      storageScore: 80,
      storageType: 'local',
      totalScore: 63,
    },
  ],
  excludedClusters: [],
  recommendation: {
    availableCPUCores: 23.74,
    availableMemoryBytes: 107653811200,
    cluster: 'cluster-a',
    node: 'node-1',
    storageType: 'cloud',
    totalScore: 83,
  },
  sourceVM: {
    cluster: 'source-cluster',
    cpuCores: 2,
    memoryBytes: 4294967296,
    name: 'test-vm',
    namespace: 'default',
    volumes: [],
  },
};

describe('ClusterRecommendationPanel', () => {
  it('should render nothing when not loaded and not loading', () => {
    const { container } = render(
      <ClusterRecommendationPanel data={null} error={null} loaded={false} loading={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should show spinner when loading', () => {
    render(<ClusterRecommendationPanel data={null} error={null} loaded={false} loading={true} />);
    expect(screen.getByText('Analyzing clusters...')).toBeInTheDocument();
  });

  it('should show error alert on failure', () => {
    render(
      <ClusterRecommendationPanel
        data={null}
        error={new Error('Network error')}
        loaded={true}
        loading={false}
      />,
    );
    expect(screen.getByText('Failed to get cluster recommendations')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('should show warning when no candidates found', () => {
    const emptyData: MigrationTargetResponse = { ...mockData, candidates: [] };
    render(
      <ClusterRecommendationPanel data={emptyData} error={null} loaded={true} loading={false} />,
    );
    expect(screen.getByText('No suitable clusters found')).toBeInTheDocument();
  });

  it('should render candidate clusters with scores', () => {
    render(
      <ClusterRecommendationPanel data={mockData} error={null} loaded={true} loading={false} />,
    );
    expect(screen.getByText('Cluster recommendations')).toBeInTheDocument();
    expect(screen.getByText('cluster-a')).toBeInTheDocument();
    expect(screen.getByText('cluster-b')).toBeInTheDocument();
  });

  it('should mark the recommended cluster with Top pick label', () => {
    render(
      <ClusterRecommendationPanel data={mockData} error={null} loaded={true} loading={false} />,
    );
    expect(screen.getByText('Top pick')).toBeInTheDocument();
  });

  it('should render storage type for each candidate', () => {
    render(
      <ClusterRecommendationPanel data={mockData} error={null} loaded={true} loading={false} />,
    );
    expect(screen.getByText('cloud')).toBeInTheDocument();
    expect(screen.getByText('local')).toBeInTheDocument();
  });

  it('should render matched storage class with singular label for one class', () => {
    render(
      <ClusterRecommendationPanel data={mockData} error={null} loaded={true} loading={false} />,
    );
    expect(screen.getByText('managed-csi')).toBeInTheDocument();
    expect(screen.getByText('standard')).toBeInTheDocument();
    expect(screen.getAllByText('Matched storage class')).toHaveLength(2);
  });

  it('should render matched storage classes with plural label for multiple classes', () => {
    const multiClassData: MigrationTargetResponse = {
      ...mockData,
      candidates: [
        {
          ...mockData.candidates[0],
          matchedStorageClasses: ['managed-csi', 'gp3-csi'],
        },
      ],
    };
    render(
      <ClusterRecommendationPanel
        data={multiClassData}
        error={null}
        loaded={true}
        loading={false}
      />,
    );
    expect(screen.getByText('Matched storage classes')).toBeInTheDocument();
    expect(screen.getByText('managed-csi, gp3-csi')).toBeInTheDocument();
  });
});
