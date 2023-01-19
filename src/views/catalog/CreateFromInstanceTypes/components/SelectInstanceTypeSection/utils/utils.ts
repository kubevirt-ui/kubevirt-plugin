import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CubesIcon, PuzzlePieceIcon, ServerGroupIcon, StarIcon } from '@patternfly/react-icons';

import {
  InstanceTypeCategory,
  InstanceTypesDetails,
  InstanceTypeSize,
  InstanceTypeSizeDetails,
} from './types';

export const findInstanceType = (
  name: InstanceTypeSize,
  instanceTypes: InstanceTypeSizeDetails[],
) => instanceTypes?.find((instanceType) => instanceType?.name === name);

export const seriesDetails: InstanceTypesDetails = {
  [InstanceTypeCategory.GeneralPurpose]: {
    title: t('General purpose applications'),
    Icon: ServerGroupIcon,
    prefix: t('n1'),
    seriesLabel: t('N Series'),
    instanceTypes: [
      {
        name: 'medium',
        label: t('medium'),
        cores: 1,
        memory: '4Gi',
      },
      {
        name: 'large',
        label: t('large'),
        cores: 2,
        memory: '8Gi',
      },
      {
        name: 'xlarge',
        label: t('xlarge'),
        cores: 4,
        memory: '16Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cores: 8,
        memory: '32Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cores: 16,
        memory: '64Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cores: 32,
        memory: '128Gi',
      },
    ],
  },
  [InstanceTypeCategory.ComputeIntensive]: {
    title: t('Compute intensive applications'),
    Icon: CubesIcon,
    prefix: t('cx1'),
    seriesLabel: t('CX Series'),
    instanceTypes: [
      {
        name: 'medium',
        label: t('medium'),
        cores: 1,
        memory: '2Gi',
      },
      {
        name: 'large',
        label: t('large'),
        cores: 2,
        memory: '4Gi',
      },
      {
        name: 'xlarge',
        label: t('xlarge'),
        cores: 4,
        memory: '8Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cores: 8,
        memory: '16Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cores: 16,
        memory: '32Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cores: 32,
        memory: '64Gi',
      },
    ],
  },
  [InstanceTypeCategory.MemoryIntensive]: {
    title: t('Memory intensive applications'),
    Icon: PuzzlePieceIcon,
    prefix: t('m1'),
    seriesLabel: t('M Series'),
    instanceTypes: [
      {
        name: 'large',
        label: t('large'),
        cores: 2,
        memory: '16Gi',
      },
      {
        name: 'xlarge',
        label: t('xlarge'),
        cores: 4,
        memory: '32Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cores: 8,
        memory: '64Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cores: 16,
        memory: '128Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cores: 32,
        memory: '256Gi',
      },
    ],
  },
  [InstanceTypeCategory.GpuResourcesAttached]: {
    title: t('NVIDIA GPU resources attached'),
    Icon: StarIcon,
    prefix: t('gn1'),
    seriesLabel: t('GN Series'),
    instanceTypes: [
      {
        name: 'xlarge',
        label: t('xlarge'),
        cores: 4,
        memory: '16Gi',
      },
      {
        name: '2xlarge',
        label: t('2xlarge'),
        cores: 8,
        memory: '32Gi',
      },
      {
        name: '4xlarge',
        label: t('4xlarge'),
        cores: 16,
        memory: '64Gi',
      },
      {
        name: '8xlarge',
        label: t('8xlarge'),
        cores: 32,
        memory: '128Gi',
      },
    ],
  },
};
