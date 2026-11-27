import { type Dispatch, type FC, type SetStateAction } from 'react';

import { type V1CPU } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCPUModels, getDefaultCPUModel } from '@kubevirt-utils/resources/hyperconverged/selectors';
import useSchedulableVirtNodes from '@kubevirt-utils/resources/node/hooks/useSchedulableVirtNodes';
import { getNodesMissingCPUModel } from '@kubevirt-utils/resources/node/utils/cpuModel';
import {
  Flex,
  HelperText,
  HelperTextItem,
  SelectOption,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import './CPUModelInput.scss';

const HOST_MODEL = 'host-model';

type CPUModelInputProps = {
  cluster?: string;
  cpu: V1CPU | undefined;
  setCPU: Dispatch<SetStateAction<V1CPU | undefined>>;
};

const CPUModelInput: FC<CPUModelInputProps> = ({ cluster, cpu, setCPU }) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverged] = useHyperConvergeConfiguration(cluster);
  const [nodes] = useSchedulableVirtNodes(cluster);
  const clusterDefault = getDefaultCPUModel(hyperConverged) || HOST_MODEL;
  const current = cpu?.model ?? '';
  const models = getCPUModels(hyperConverged);
  const options =
    current && current !== HOST_MODEL && !models.some((model) => model.name === current)
      ? [...models, { name: current }]
      : models;
  const selectedKnown = models.some((model) => model.name === current);
  const unavailable =
    Boolean(current) &&
    current !== HOST_MODEL &&
    (!selectedKnown || getNodesMissingCPUModel(nodes, current).length > 0);
  const clusterDefaultLabel = t('Cluster default ({{model}})', {
    model: clusterDefault === HOST_MODEL ? t('host-model') : clusterDefault,
  });
  const selected = current === HOST_MODEL && clusterDefault === HOST_MODEL ? '' : current;

  return (
    <div className="cpu-model">
      <Title className="cpu-model__title" headingLevel="h6" size={TitleSizes.md}>
        {t('CPU model')}
      </Title>
      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
        <FormPFSelect
          onSelect={(_event, value) => {
            const model = String(value ?? '');
            setCPU((currentCPU) => {
              if (!model) {
                const next = { ...(currentCPU ?? {}) };
                delete next.model;
                return Object.keys(next).length > 0 ? next : undefined;
              }
              return { ...(currentCPU ?? {}), model };
            });
          }}
          selected={selected}
          selectedLabel={selected || clusterDefaultLabel}
          toggleProps={{ 'data-test': 'cpu-model-select', id: 'cpu-model' }}
        >
          <SelectOption value="">{clusterDefaultLabel}</SelectOption>
          {clusterDefault !== HOST_MODEL && (
            <SelectOption value={HOST_MODEL}>{t('host-model')}</SelectOption>
          )}
          {options.map((model) => (
            <SelectOption
              description={
                getNodesMissingCPUModel(nodes, model.name).length > 0
                  ? t('Not available on every node')
                  : undefined
              }
              key={model.name}
              value={model.name}
            >
              {model.name}
            </SelectOption>
          ))}
        </FormPFSelect>
        <HelpTextIcon
          bodyContent={t(
            'host-model uses the node CPU. Live migration can fail on a different CPU. A shared model runs on every schedulable node, with only the features they share.',
          )}
        />
      </Flex>
      {unavailable && (
        <HelperText className="cpu-model__warning">
          <HelperTextItem variant="warning">
            {t(
              'This VM can start only on nodes that support this model. Live migration to the others will fail.',
            )}
          </HelperTextItem>
        </HelperText>
      )}
    </div>
  );
};

export default CPUModelInput;
