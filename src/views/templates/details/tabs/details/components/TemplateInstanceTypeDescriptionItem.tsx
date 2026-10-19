import { type FC, useMemo } from 'react';

import { INSTANCETYPE_CLASS_DISPLAY_NAME } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import InstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/InstanceTypeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import useClusterInstanceTypes from '@kubevirt-utils/hooks/useClusterInstanceTypes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getInstanceTypeCPU,
  getInstanceTypeMemory,
} from '@kubevirt-utils/resources/instancetype/selectors';
import { getAnnotation, getName } from '@kubevirt-utils/resources/shared';
import {
  createTemplateInstanceTypeSubmit,
  getResolvedInstanceTypeName,
  getTemplateVirtualMachineObject,
  type Template,
} from '@kubevirt-utils/resources/template';
import { getCPUMemoryDisplayValue } from '@kubevirt-utils/resources/vm';
import { OLSPromptType } from '@lightspeed/utils/prompts';

type TemplateInstanceTypeDescriptionItemProps = {
  editable: boolean;
  template: Template;
};

const TemplateInstanceTypeDescriptionItem: FC<TemplateInstanceTypeDescriptionItemProps> = ({
  editable,
  template,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const vm = getTemplateVirtualMachineObject(template);
  const resolvedName = getResolvedInstanceTypeName(template);
  const [clusterInstanceTypes] = useClusterInstanceTypes();

  const currentInstanceType = useMemo(
    () =>
      clusterInstanceTypes.find(
        (instanceTypeResource) => getName(instanceTypeResource) === resolvedName,
      ),
    [clusterInstanceTypes, resolvedName],
  );

  const cpuMemoryText = useMemo(() => {
    if (!currentInstanceType) return undefined;
    const cpuCount = getInstanceTypeCPU(currentInstanceType);
    const memory = getInstanceTypeMemory(currentInstanceType)?.toString();
    return getCPUMemoryDisplayValue(cpuCount ? { cores: cpuCount } : undefined, memory, t)
      .cpuMemoryText;
  }, [currentInstanceType, t]);

  const onEditClick = (): void =>
    createModal?.(({ isOpen, onClose }) => (
      <InstanceTypeModal
        allInstanceTypes={clusterInstanceTypes}
        instanceType={currentInstanceType}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={createTemplateInstanceTypeSubmit(template)}
        vm={vm}
      />
    ));

  return (
    <DescriptionItem
      descriptionData={cpuMemoryText ?? <MutedTextSpan text={t('Unknown')} />}
      descriptionHeader={t('InstanceType')}
      isEdit={editable}
      olsObj={template}
      onEditClick={onEditClick}
      promptType={OLSPromptType.CPU_MEMORY}
      subTitle={
        currentInstanceType && getAnnotation(currentInstanceType, INSTANCETYPE_CLASS_DISPLAY_NAME)
      }
    />
  );
};

export default TemplateInstanceTypeDescriptionItem;
