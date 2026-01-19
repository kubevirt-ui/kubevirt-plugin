import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  static readonly CPU = new TopConsumerMetric('cpu', {
    chartLabel: t('CPU'),
    dropdownLabel: t('By CPU'),
  });

  static readonly MEMORY = new TopConsumerMetric('memory', {
    chartLabel: t('Memory'),
    dropdownLabel: t('By memory'),
  });

  static readonly MEMORY_SWAP_TRAFFIC = new TopConsumerMetric('memory-swap-traffic', {
    chartLabel: t('Memory swap traffic'),
    dropdownLabel: t('By memory swap traffic'),
  });

  static readonly STORAGE_IOPS = new TopConsumerMetric('storage-iops', {
    chartLabel: t('Storage IOPS'),
    dropdownLabel: t('By IOPS'),
  });

  static readonly STORAGE_READ_LATENCY = new TopConsumerMetric('storage-read-latency', {
    chartLabel: t('Storage read latency'),
    dropdownLabel: t('By read latency'),
  });

  static readonly STORAGE_THROUGHPUT = new TopConsumerMetric('storage-throughput', {
    chartLabel: t('Storage throughput'),
    dropdownLabel: t('By throughput'),
  });

  static readonly STORAGE_WRITE_LATENCY = new TopConsumerMetric('storage-write-latency', {
    chartLabel: t('Storage write latency'),
    dropdownLabel: t('By write latency'),
  });

  static readonly VCPU_WAIT = new TopConsumerMetric('vcpu-wait', {
    chartLabel: t('vCPU wait'),
    dropdownLabel: t('By vCPU wait'),
  });

  private static readonly all = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<TopConsumerMetric>(TopConsumerMetric),
  );

  private static readonly dropdownLabelMapper = TopConsumerMetric.all.reduce(
    (accumulator, metric: TopConsumerMetric) => ({
      ...accumulator,
      [metric.dropdownLabel]: metric,
    }),
    {},
  );

  static fromDropdownLabel = (dropdownLabel: string): TopConsumerMetric =>
    TopConsumerMetric.dropdownLabelMapper[dropdownLabel];

  static fromString = (source: string): TopConsumerMetric => TopConsumerMetric.stringMapper[source];

  static getAll = () => TopConsumerMetric.all;

  private static readonly stringMapper = TopConsumerMetric.all.reduce(
    (accumulator, metric: TopConsumerMetric) => ({
      ...accumulator,
      [metric.value]: metric,
    }),
    {},
  );
}
