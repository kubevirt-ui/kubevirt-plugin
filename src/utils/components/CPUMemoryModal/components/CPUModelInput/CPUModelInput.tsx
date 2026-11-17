import { type Dispatch, type FC, type SetStateAction } from 'react';

import {
  type V1CPU,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getCpuModels, getDefaultCPUModel } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getCPU } from '@kubevirt-utils/resources/vm';
import {
  Flex,
  HelperText,
  HelperTextItem,
  SelectOption,
  Stack,
  StackItem,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import './CPUModelInput.scss';

const HOST_MODEL = 'host-model';

type CPUModelInputProps = {
  cluster?: string;
  cpu: V1CPU | undefined;
  setCPU: Dispatch<SetStateAction<V1CPU | undefined>>;
  vmi?: V1VirtualMachineInstance;
};

const CPUModelInput: FC<CPUModelInputProps> = ({ cluster, cpu, setCPU, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverged] = useHyperConvergeConfiguration(cluster);
  const rawDefault = getDefaultCPUModel(hyperConverged);
  const clusterDefault = rawDefault || HOST_MODEL;
  const current = cpu?.model ?? '';
  const selected =
    (!rawDefault || rawDefault === HOST_MODEL) && current === HOST_MODEL ? '' : current;
  const statusModels = getCpuModels(hyperConverged);
  const models = [...statusModels];
  const runningModel = vmi ? getCPU(vmi)?.model || HOST_MODEL : undefined;
  const highlightRunning = Boolean(runningModel) && runningModel !== clusterDefault;

  for (const name of [current, highlightRunning ? runningModel : undefined]) {
    if (name && name !== HOST_MODEL && !models.some((model) => model.name === name)) {
      models.push({ name });
    }
  }

  const selectedModel = statusModels.find((model) => model.name === current);
  const unavailable =
    Boolean(current) &&
    current !== HOST_MODEL &&
    (!selectedModel || !!selectedModel.unsupportedNodes?.length);
  const clusterDefaultLabel = t('Cluster default ({{model}})', {
    model: clusterDefault === HOST_MODEL ? t('host-model') : clusterDefault,
  });

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
              const next: V1CPU = { ...(currentCPU ?? {}) };
              if (model) {
                next.model = model;
              } else {
                delete next.model;
              }
              return Object.keys(next).length > 0 ? next : undefined;
            });
          }}
          selected={selected}
          selectedLabel={selected || clusterDefaultLabel}
          toggleProps={{ 'data-test': 'cpu-model-select', id: 'cpu-model' }}
        >
          <SelectOption value="">{clusterDefaultLabel}</SelectOption>
          {clusterDefault !== HOST_MODEL && (
            <SelectOption
              description={
                highlightRunning && runningModel === HOST_MODEL
                  ? t('Currently running')
                  : undefined
              }
              value={HOST_MODEL}
            >
              {t('host-model')}
            </SelectOption>
          )}
          {models.map((model) => {
            const status = statusModels.find((entry) => entry.name === model.name);
            let description: string | undefined;
            if (highlightRunning && model.name === runningModel) {
              description = t('Currently running');
            } else if (!status || status.unsupportedNodes?.length) {
              description = t('Not available on every node');
            }
            return (
              <SelectOption description={description} key={model.name} value={model.name}>
                {model.name}
              </SelectOption>
            );
          })}
        </FormPFSelect>
        <HelpTextIcon
          bodyContent={
            <Stack hasGutter>
              <StackItem>
                {t('host-model uses the node CPU. Live migration can fail on a different CPU.')}
              </StackItem>
              <StackItem>
                {t(
                  'A shared model runs on every schedulable node, with only the features they share.',
                )}
              </StackItem>
            </Stack>
          }
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
