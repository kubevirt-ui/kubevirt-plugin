import DropdownEnum from '@kubevirt-utils/utils/dropdownEnum';
import { ObjectEnum } from '@kubevirt-utils/utils/ObjectEnum';

type TopConsumerMetricData = {
  chartLabel: string;
  dropdownLabel: string;
};

abstract class TopConsumerMetricObjectEnum<T> extends DropdownEnum<T> {
  private readonly chartLabel: string;

  protected readonly dropdownLabel: string;

  getChartLabel = (): string => this.chartLabel;

  protected constructor(value: T, { chartLabel, dropdownLabel }: TopConsumerMetricData) {
    super(value, { dropdownLabel });
    this.dropdownLabel = dropdownLabel;
    this.chartLabel = chartLabel;
  }
}

export class TopConsumerMetric extends TopConsumerMetricObjectEnum<string> {
  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<TopConsumerMetric>(TopConsumerMetric),
  );

  static readonly CPU = new TopConsumerMetric('cpu', {
    chartLabel: 'CPU',
    dropdownLabel: 'By CPU',
  });

  private static readonly dropdownLabelMapper = TopConsumerMetric.ALL.reduce(
    (accumulator, metric: TopConsumerMetric) => ({
      ...accumulator,
      [metric.dropdownLabel]: metric,
    }),
    {},
  );

  static fromDropdownLabel = (dropdownLabel: string): TopConsumerMetric =>
    TopConsumerMetric.dropdownLabelMapper[dropdownLabel];

  static fromString = (source: string): TopConsumerMetric => TopConsumerMetric.stringMapper[source];

  static getAll = () => TopConsumerMetric.ALL;

  static readonly MEMORY = new TopConsumerMetric('memory', {
    chartLabel: 'Memory',
    dropdownLabel: 'By memory',
  });

  static readonly MEMORY_SWAP_TRAFFIC = new TopConsumerMetric('memory-swap-traffic', {
    chartLabel: 'Memory swap traffic',
    dropdownLabel: 'By memory swap traffic',
  });

  static readonly STORAGE_IOPS = new TopConsumerMetric('storage-iops', {
    chartLabel: 'Storage IOPS',
    dropdownLabel: 'By IOPS',
  });

  static readonly STORAGE_THROUGHPUT = new TopConsumerMetric('storage-throughput', {
    chartLabel: 'Storage throughput',
    dropdownLabel: 'By throughput',
  });

  private static readonly stringMapper = TopConsumerMetric.ALL.reduce(
    (accumulator, metric: TopConsumerMetric) => ({
      ...accumulator,
      [metric.value]: metric,
    }),
    {},
  );

  static readonly VCPU_WAIT = new TopConsumerMetric('vcpu-wait', {
    chartLabel: 'vCPU wait',
    dropdownLabel: 'By vCPU wait',
  });
}
