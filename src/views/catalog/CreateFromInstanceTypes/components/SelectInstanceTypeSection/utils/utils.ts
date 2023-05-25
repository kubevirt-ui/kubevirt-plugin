import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CubesIcon, PuzzlePieceIcon, ServerGroupIcon, StarIcon } from '@patternfly/react-icons';

import { CategoryDetailsMap, InstanceTypeCategory } from './types';

export const categoryDetailsMap: CategoryDetailsMap = {
  [InstanceTypeCategory.GeneralPurpose]: {
    title: t('General purpose applications'),
    Icon: ServerGroupIcon,
    prefix: 'n1',
    prefixLabel: t('n1'),
    seriesLabel: t('N Series'),
    instanceTypes: [
      {
        name: 'medium',
        label: t('medium'),
        cpus: 1,
        memory: '4Gi',
      },
      {
        name: 'large',
        label: t('large'),
        cpus: 2,
        memory: '8Gi',
      },
      {
        name: 'xlarge',
        label: t('xlarge'),
        cpus: 4,
        memory: '16Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cpus: 8,
        memory: '32Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cpus: 16,
        memory: '64Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cpus: 32,
        memory: '128Gi',
      },
    ],
  },
  [InstanceTypeCategory.ComputeIntensive]: {
    title: t('Compute-intensive applications'),
    Icon: CubesIcon,
    prefix: 'cx1',
    prefixLabel: t('cx1'),
    seriesLabel: t('CX Series'),
    instanceTypes: [
      {
        name: 'medium',
        label: t('medium'),
        cpus: 1,
        memory: '2Gi',
      },
      {
        name: 'large',
        label: t('large'),
        cpus: 2,
        memory: '4Gi',
      },
      {
        name: 'xlarge',
        label: t('xlarge'),
        cpus: 4,
        memory: '8Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cpus: 8,
        memory: '16Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cpus: 16,
        memory: '32Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cpus: 32,
        memory: '64Gi',
      },
    ],
  },
  [InstanceTypeCategory.MemoryIntensive]: {
    title: t('Memory-intensive applications'),
    Icon: PuzzlePieceIcon,
    prefix: 'm1',
    prefixLabel: t('m1'),
    seriesLabel: t('M Series'),
    instanceTypes: [
      {
        name: 'large',
        label: t('large'),
        cpus: 2,
        memory: '16Gi',
      },
      {
        name: 'xlarge',
        label: t('xlarge'),
        cpus: 4,
        memory: '32Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cpus: 8,
        memory: '64Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cpus: 16,
        memory: '128Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cpus: 32,
        memory: '256Gi',
      },
    ],
  },
  [InstanceTypeCategory.GpuResourcesAttached]: {
    title: t('Attached NVIDIA GPU resources'),
    Icon: StarIcon,
    prefix: 'gn1',
    prefixLabel: t('gn1'),
    seriesLabel: t('GN Series'),
    instanceTypes: [
      {
        name: 'xlarge',
        label: t('xlarge'),
        cpus: 4,
        memory: '16Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cpus: 8,
        memory: '32Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cpus: 16,
        memory: '64Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cpus: 32,
        memory: '128Gi',
      },
    ],
  },
};
