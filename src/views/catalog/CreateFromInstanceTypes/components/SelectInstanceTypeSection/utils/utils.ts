import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CubesIcon, PuzzlePieceIcon, ServerGroupIcon, StarIcon } from '@patternfly/react-icons';

import { CategoryDetailsMap, InstanceTypeCategory } from './types';

export const categoryDetailsMap: CategoryDetailsMap = {
  [InstanceTypeCategory.ComputeIntensive]: {
    Icon: CubesIcon,
    instanceTypes: [
      {
        cpus: 1,
        label: t('medium'),
        memory: '2Gi',
        name: 'medium',
      },
      {
        cpus: 2,
        label: t('large'),
        memory: '4Gi',
        name: 'large',
      },
      {
        cpus: 4,
        label: t('xlarge'),
        memory: '8Gi',
        name: 'xlarge',
      },
      {
        cpus: 8,
        label: t('2xlarge'),
        memory: '16Gi',
        name: '2xlarge',
      },
      {
        cpus: 16,
        label: t('4xlarge'),
        memory: '32Gi',
        name: '4xlarge',
      },
      {
        cpus: 32,
        label: t('8xlarge'),
        memory: '64Gi',
        name: '8xlarge',
      },
    ],
    prefix: 'cx1',
    prefixLabel: t('cx1'),
    seriesLabel: t('CX Series'),
    title: t('Compute-intensive applications'),
  },
  [InstanceTypeCategory.GeneralPurpose]: {
    Icon: ServerGroupIcon,
    instanceTypes: [
      {
        cpus: 1,
        label: t('medium'),
        memory: '4Gi',
        name: 'medium',
      },
      {
        cpus: 2,
        label: t('large'),
        memory: '8Gi',
        name: 'large',
      },
      {
        cpus: 4,
        label: t('xlarge'),
        memory: '16Gi',
        name: 'xlarge',
      },
      {
        cpus: 8,
        label: t('2xlarge'),
        memory: '32Gi',
        name: '2xlarge',
      },
      {
        cpus: 16,
        label: t('4xlarge'),
        memory: '64Gi',
        name: '4xlarge',
      },
      {
        cpus: 32,
        label: t('8xlarge'),
        memory: '128Gi',
        name: '8xlarge',
      },
    ],
    prefix: 'n1',
    prefixLabel: t('n1'),
    seriesLabel: t('N Series'),
    title: t('General purpose applications'),
  },
  [InstanceTypeCategory.GpuResourcesAttached]: {
    Icon: StarIcon,
    instanceTypes: [
      {
        cpus: 4,
        label: t('xlarge'),
        memory: '16Gi',
        name: 'xlarge',
      },
      {
        cpus: 8,
        label: t('2xlarge'),
        memory: '32Gi',
        name: '2xlarge',
      },
      {
        cpus: 16,
        label: t('4xlarge'),
        memory: '64Gi',
        name: '4xlarge',
      },
      {
        cpus: 32,
        label: t('8xlarge'),
        memory: '128Gi',
        name: '8xlarge',
      },
    ],
    prefix: 'gn1',
    prefixLabel: t('gn1'),
    seriesLabel: t('GN Series'),
    title: t('Attached NVIDIA GPU resources'),
  },
  [InstanceTypeCategory.MemoryIntensive]: {
    Icon: PuzzlePieceIcon,
    instanceTypes: [
      {
        cpus: 2,
        label: t('large'),
        memory: '16Gi',
        name: 'large',
      },
      {
        cpus: 4,
        label: t('xlarge'),
        memory: '32Gi',
        name: 'xlarge',
      },
      {
        cpus: 8,
        label: t('2xlarge'),
        memory: '64Gi',
        name: '2xlarge',
      },
      {
        cpus: 16,
        label: t('4xlarge'),
        memory: '128Gi',
        name: '4xlarge',
      },
      {
        cpus: 32,
        label: t('8xlarge'),
        memory: '256Gi',
        name: '8xlarge',
      },
    ],
    prefix: 'm1',
    prefixLabel: t('m1'),
    seriesLabel: t('M Series'),
    title: t('Memory-intensive applications'),
  },
};
