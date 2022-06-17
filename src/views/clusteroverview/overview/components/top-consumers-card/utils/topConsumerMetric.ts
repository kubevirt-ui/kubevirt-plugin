import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

type TopConsumerMetricData = {
  dropdownLabel: string;
  chartLabel: string;
};

abstract class TopConsumerMetricObjectEnum<T> extends ObjectEnum<T> {
  protected readonly dropdownLabel: string;

  private readonly chartLabel: string;

  protected constructor(value: T, { dropdownLabel, chartLabel }: TopConsumerMetricData) {
    super(value);
    this.dropdownLabel = dropdownLabel;
    this.chartLabel = chartLabel;
  }

  getDropdownLabel = (): string => this.dropdownLabel;

  getChartLabel = (): string => this.chartLabel;
}

export class TopConsumerMetric extends TopConsumerMetricObjectEnum<string> {
  static readonly CPU = new TopConsumerMetric('cpu', {
    // t('By CPU')
    dropdownLabel: 'By CPU',
    // t('CPU')
    chartLabel: 'CPU',
  });

  static readonly MEMORY = new TopConsumerMetric('memory', {
    // t('By memory')
    dropdownLabel: 'By memory',
    // t('Memory')
    chartLabel: 'Memory',
  });

  static readonly MEMORY_SWAP_TRAFFIC = new TopConsumerMetric('memory-swap-traffic', {
    // t('By memory swap traffic')
    dropdownLabel: 'By memory swap traffic',
    // t('Memory swap traffic')
    chartLabel: 'Memory swap traffic',
  });

  static readonly VCPU_WAIT = new TopConsumerMetric('vcpu-wait', {
    // t('By vCPU wait')
    dropdownLabel: 'By vCPU wait',
    // t('vCPU wait')
    chartLabel: 'vCPU wait',
  });

  static readonly STORAGE_THROUGHPUT = new TopConsumerMetric('storage-throughput', {
    // t('By throughput')
    dropdownLabel: 'By throughput',
    // t('Storage throughput')
    chartLabel: 'Storage throughput',
  });

  static readonly STORAGE_IOPS = new TopConsumerMetric('storage-iops', {
    // t('By IOPS')
    dropdownLabel: 'By IOPS',
    // t('Storage IOPS')
    chartLabel: 'Storage IOPS',
  });

  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<TopConsumerMetric>(TopConsumerMetric),
  );

  static getAll = () => TopConsumerMetric.ALL;

  private static readonly stringMapper = TopConsumerMetric.ALL.reduce(
    (accumulator, metric: TopConsumerMetric) => ({
      ...accumulator,
      [metric.value]: metric,
    }),
    {},
  );

  private static readonly dropdownLabelMapper = TopConsumerMetric.ALL.reduce(
    (accumulator, metric: TopConsumerMetric) => ({
      ...accumulator,
      [metric.dropdownLabel]: metric,
    }),
    {},
  );

  static fromString = (source: string): TopConsumerMetric => TopConsumerMetric.stringMapper[source];

  static fromDropdownLabel = (dropdownLabel: string): TopConsumerMetric =>
    TopConsumerMetric.dropdownLabelMapper[dropdownLabel];
}
