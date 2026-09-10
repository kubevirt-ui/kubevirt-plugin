export enum ResourceKeyKind {
  COUNT = 'COUNT',
  CPU = 'CPU',
  MEMORY = 'MEMORY',
}

export type StatusChartInfo = {
  available: number;
  availableText: string;
  max: number;
  maxText: string;
  percentage: number;
  resourceKeyKind: ResourceKeyKind;
  resourceLabel: string;
  subTitle: string;
  title: string;
  used: number;
  usedText: string;
};
