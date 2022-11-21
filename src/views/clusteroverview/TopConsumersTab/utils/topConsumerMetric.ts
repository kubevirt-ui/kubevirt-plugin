import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';
import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

type TopConsumerMetricData = {
  dropdownLabel: string;
  chartLabel: string;
};

abstract class TopConsumerMetricObjectEnum<T> extends DropdownEnum<T> {
  protected readonly dropdownLabel: string;

  private readonly chartLabel: string;

  protected constructor(value: T, { dropdownLabel, chartLabel }: TopConsumerMetricData) {
    super(value, { dropdownLabel });
    this.dropdownLabel = dropdownLabel;
    this.chartLabel = chartLabel;
  }

  getChartLabel = (): string => this.chartLabel;
}

export class TopConsumerMetric extends TopConsumerMetricObjectEnum<string> {
  static readonly CPU = new TopConsumerMetric('cpu', {
    dropdownLabel: 'By CPU',
    chartLabel: 'CPU',
  });

  static readonly MEMORY = new TopConsumerMetric('memory', {
    dropdownLabel: 'By memory',
    chartLabel: 'Memory',
  });

  static readonly MEMORY_SWAP_TRAFFIC = new TopConsumerMetric('memory-swap-traffic', {
    dropdownLabel: 'By memory swap traffic',
    chartLabel: 'Memory swap traffic',
  });

  static readonly VCPU_WAIT = new TopConsumerMetric('vcpu-wait', {
    dropdownLabel: 'By vCPU wait',
    chartLabel: 'vCPU wait',
  });

  static readonly STORAGE_THROUGHPUT = new TopConsumerMetric('storage-throughput', {
    dropdownLabel: 'By throughput',
    chartLabel: 'Storage throughput',
  });

  static readonly STORAGE_IOPS = new TopConsumerMetric('storage-iops', {
    dropdownLabel: 'By IOPS',
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
