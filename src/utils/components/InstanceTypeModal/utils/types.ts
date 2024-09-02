import { InstanceTypeUnion } from '@virtualmachines/details/tabs/configuration/utils/types';

export type InstanceTypesSeries =
  | 'cx1'
  | 'gn1'
  | 'highperformance'
  | 'm1'
  | 'n1'
  | 'o1'
  | 'rt1'
  | 'u1';

export type InstanceTypesSizes =
  | '2xlarge'
  | '4xlarge'
  | '8xlarge'
  | 'large'
  | 'medium'
  | 'micro'
  | 'nano'
  | 'small'
  | 'xlarge';

export type MappedInstanceTypes = Record<
  InstanceTypesSeries,
  {
    sizes: {
      [key in InstanceTypesSizes]?: {
        instanceType: InstanceTypeUnion;
        prettyDisplaySize: string;
        series: string;
        seriesDisplayName: string;
        size: string;
      };
    };
  } & { descriptionSeries?: string; displayNameSeries?: string }
>;
