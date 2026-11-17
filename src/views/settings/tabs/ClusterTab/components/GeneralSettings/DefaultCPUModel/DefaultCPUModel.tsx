import { type FC, useEffect, useState } from 'react';

import NewBadge from '@kubevirt-utils/components/badges/NewBadge/NewBadge';
import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import FormPFSelect from '@kubevirt-utils/components/FormPFSelect/FormPFSelect';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import NodeLink from '@kubevirt-utils/components/NodeLink/NodeLink';
import { K8S_OPS } from '@kubevirt-utils/constants/constants';
import useCanPatchHyperConverged from '@kubevirt-utils/hooks/useCanPatchHyperConverged';
import { type HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getHyperConvergedModelFromResource } from '@kubevirt-utils/resources/hyperconverged/model';
import {
  buildHyperConvergedPatch,
  getVirtualMachineOptionsPatchPath,
} from '@kubevirt-utils/resources/hyperconverged/patchUtils';
import { getCpuModels, getDefaultCPUModel } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { kubevirtK8sPatch } from '@multicluster/k8sRequests';
import {
  Alert,
  AlertVariant,
  Button,
  Flex,
  Form,
  SelectOption,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import { CLUSTER_TAB_IDS } from '@settings/search/constants';

import { getGeneralSettingsLabels, type HyperConvergeConfigurationWatch } from '../consts/consts';
import GeneralSettingsError from '../shared/GeneralSettingsError';

type DefaultCPUModelProps = {
  hyperConvergeConfiguration: HyperConvergeConfigurationWatch;
};

const DefaultCPUModel: FC<DefaultCPUModelProps> = ({ hyperConvergeConfiguration }) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [canPatchHyperConverged] = useCanPatchHyperConverged(cluster);
  const [hyperConverge, loaded] = hyperConvergeConfiguration;
  const savedModel = getDefaultCPUModel(hyperConverge) ?? '';
  const [selected, setSelected] = useState(savedModel);
  const [error, setError] = useState<unknown>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelected(savedModel);
  }, [savedModel]);

  if (!loaded) return <Skeleton width="300px" />;

  const models = getCpuModels(hyperConverge);
  const options = [...models];
  if (savedModel && !options.some((model) => model.name === savedModel)) {
    options.push({ name: savedModel });
  }
  const selectedModel = models.find((model) => model.name === selected);
  const missingNodes = selectedModel?.unsupportedNodes ?? [];
  const unavailable = Boolean(selected) && (!selectedModel || missingNodes.length > 0);
  const isDisabled = !canPatchHyperConverged || isSaving;

  const onSave = async (): Promise<void> => {
    setError(null);
    setIsSaving(true);
    try {
      const path = getVirtualMachineOptionsPatchPath(hyperConverge, 'defaultCPUModel');
      const data = !selected
        ? [{ op: K8S_OPS.REMOVE, path }]
        : buildHyperConvergedPatch(hyperConverge, {
            op: savedModel ? K8S_OPS.REPLACE : K8S_OPS.ADD,
            path,
            value: selected,
          });
      await kubevirtK8sPatch<HyperConverged>({
        cluster,
        data,
        model: getHyperConvergedModelFromResource(hyperConverge),
        resource: hyperConverge,
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ExpandSectionWithCustomToggle
      customContent={<NewBadge />}
      id={CLUSTER_TAB_IDS.defaultCPUModel}
      isIndented
      searchItemId={CLUSTER_TAB_IDS.defaultCPUModel}
      toggleClassname="ExpandSection"
      toggleContent={getGeneralSettingsLabels(t).defaultCPUModel}
    >
      <Form>
        <Stack hasGutter>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            <FormPFSelect
              isDisabled={isDisabled}
              onSelect={(_event, value) => setSelected(String(value ?? ''))}
              selected={selected}
              selectedLabel={selected || t('host-model')}
              toggleProps={{ 'data-test': 'default-cpu-model-select', id: 'default-cpu-model' }}
            >
              <SelectOption value="">{t('host-model')}</SelectOption>
              {options.map((model) => {
                const status = models.find((entry) => entry.name === model.name);
                return (
                  <SelectOption
                    description={
                      !status || status.unsupportedNodes?.length
                        ? t('Not available on every node')
                        : undefined
                    }
                    key={model.name}
                    value={model.name}
                  >
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
                      'A named model applies to new VMs. Models not on every node restrict where those VMs can start and migrate.',
                    )}
                  </StackItem>
                </Stack>
              }
            />
          </Flex>
          {unavailable && (
            <Alert
              data-test="default-cpu-model-warning"
              isInline
              title={t(
                'New VMs using this default can start only on nodes that support this model. Live migration to the others will fail.',
              )}
              variant={AlertVariant.warning}
            >
              {missingNodes.map((nodeName) => (
                <NodeLink cluster={cluster} key={nodeName} nodeName={nodeName} />
              ))}
            </Alert>
          )}
          {selected !== savedModel && (
            <Button
              isDisabled={isDisabled}
              isLoading={isSaving}
              onClick={onSave}
              variant="secondary"
            >
              {t('Save')}
            </Button>
          )}
        </Stack>
      </Form>
      <GeneralSettingsError error={error} />
    </ExpandSectionWithCustomToggle>
  );
};

export default DefaultCPUModel;
