import { type FC, useState } from 'react';

import { ConfigMapModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import {
  getRunStrategyDescriptions,
  getRunStrategyLabels,
} from '@kubevirt-utils/components/RunStrategyModal/utils';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import useDefaultRunStrategy from '@kubevirt-utils/hooks/useDefaultRunStrategy/useDefaultRunStrategy';
import {
  DEFAULT_RUN_STRATEGY,
  FEATURES_CONFIG_MAP_NAME,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import useFeaturesConfigMap from '@kubevirt-utils/hooks/useFeatures/useFeaturesConfigMap';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  isRunStrategyValue,
  type RunStrategy,
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
  RUNSTRATEGY_RERUNONFAILURE,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { operatorNamespaceSignal } from '@kubevirt-utils/store/operatorNamespace';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import {
  Alert,
  AlertVariant,
  Content,
  ContentVariants,
  FormGroup,
  SelectOption,
} from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsLabels } from '../consts/consts';

const RUN_STRATEGIES = [
  RUNSTRATEGY_RERUNONFAILURE,
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  RUNSTRATEGY_MANUAL,
] as const;

const DefaultRunStrategy: FC = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const selected = useDefaultRunStrategy(cluster);
  const {
    canEditFeaturesConfigMap,
    featuresConfigMapData: [featureConfigMap, loaded],
  } = useFeaturesConfigMap(cluster);
  const [error, setError] = useState<string>(null);
  const [isSaving, setIsSaving] = useState(false);
  const labels = getRunStrategyLabels(t);
  const descriptions = getRunStrategyDescriptions(t);
  const operatorNamespace = operatorNamespaceSignal.value;

  const onSelect = async (_event: unknown, value: number | string): Promise<void> => {
    if (typeof value !== 'string' || !isRunStrategyValue(value) || value === selected) {
      return;
    }
    if (!operatorNamespace) {
      return;
    }

    const savedValue = featureConfigMap?.data?.[DEFAULT_RUN_STRATEGY];
    setError(null);
    setIsSaving(true);

    try {
      await kubevirtK8sPatch({
        cluster,
        data: [
          {
            op: savedValue === undefined ? K8S_OPS.ADD : K8S_OPS.REPLACE,
            path: `/data/${DEFAULT_RUN_STRATEGY}`,
            value,
          },
        ],
        model: ConfigMapModel,
        resource: {
          metadata: {
            name: FEATURES_CONFIG_MAP_NAME,
            namespace: operatorNamespace,
          },
        },
      });
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ExpandSection
      dataTestID="default-run-strategy"
      searchItemId={CLUSTER_TAB_IDS.defaultRunStrategy}
      toggleText={getGeneralSettingsLabels(t).defaultRunStrategy}
    >
      <FormGroup
        fieldId="default-run-strategy-select"
        label={t('Run strategy for new virtual machines')}
      >
        <FormPFSelect
          isDisabled={!loaded || !canEditFeaturesConfigMap || isSaving}
          onSelect={onSelect}
          selected={selected}
          selectedLabel={labels[selected]}
          toggleProps={{ 'data-test': 'default-run-strategy-select' }}
        >
          {RUN_STRATEGIES.map((strategy: RunStrategy) => (
            <SelectOption description={descriptions[strategy]} key={strategy} value={strategy}>
              {labels[strategy]}
            </SelectOption>
          ))}
        </FormPFSelect>
      </FormGroup>
      <Content className="pf-v6-u-mt-sm" component={ContentVariants.small}>
        {t(
          'Applied when a new virtual machine is created. Rerun on failure is used when this has not been changed.',
        )}
      </Content>
      {error && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default DefaultRunStrategy;
