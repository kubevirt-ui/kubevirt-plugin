import { type FC, type ReactNode, useCallback, useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { INSTANCETYPE_CLASS_DISPLAY_NAME } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import InstanceTypeModal from '@kubevirt-utils/components/InstanceTypeModal/InstanceTypeModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeCPUMemoryDisplayText } from '@kubevirt-utils/resources/instancetype/selectors';
import { type InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getAnnotation, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { getCluster } from '@multicluster/helpers/selectors';
import { Skeleton } from '@patternfly/react-core';
import { useWizardVMDraft } from '@virtualmachines/wizard/hooks/useWizardVMDraft';

type WizardInstanceTypeCPUMemoryProps = {
  vm: V1VirtualMachine;
};

const WizardInstanceTypeCPUMemory: FC<WizardInstanceTypeCPUMemoryProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const { replaceDraft } = useWizardVMDraft();
  const vmName = getName(vm);
  const namespace = getNamespace(vm);
  const cluster = getCluster(vm);

  const { allInstanceTypes, loaded: instanceTypesLoaded } = useInstanceTypesAndPreferences(
    namespace,
    cluster,
  );

  const instanceType = useMemo(
    () =>
      allInstanceTypes.find(
        (instanceTypeResource) => getName(instanceTypeResource) === vm.spec?.instancetype?.name,
      ),
    [allInstanceTypes, vm.spec?.instancetype?.name],
  );

  const instanceTypeCpuMemoryText = useMemo(
    () => getInstanceTypeCPUMemoryDisplayText(instanceType, t),
    [instanceType, t],
  );

  const onSubmitInstanceType = useCallback(
    (
      vmToUpdate: V1VirtualMachine,
      selectedInstanceType: InstanceTypeUnion,
    ): Promise<V1VirtualMachine> => {
      const updatedVM: V1VirtualMachine = {
        ...vmToUpdate,
        spec: {
          ...vmToUpdate.spec,
          instancetype: {
            kind: selectedInstanceType.kind,
            name: getName(selectedInstanceType),
          },
        },
      };
      replaceDraft(updatedVM, vm);
      return Promise.resolve(updatedVM);
    },
    [replaceDraft, vm],
  );

  const descriptionData: ReactNode = ((): ReactNode => {
    if (!instanceTypesLoaded) {
      return <Skeleton className="pf-m-width-sm" />;
    }
    return instanceTypeCpuMemoryText ?? <MutedTextSpan text={t('Unknown')} />;
  })();

  return (
    <DescriptionItem
      data-test={`${vmName}-cpu-memory`}
      descriptionData={descriptionData}
      descriptionHeader={<SearchItem id="cpu-memory">{t('InstanceType')}</SearchItem>}
      isEdit={instanceTypesLoaded}
      isPopover
      olsObj={vm}
      onEditClick={() =>
        createModal?.(({ isOpen, onClose }) => (
          <InstanceTypeModal
            allInstanceTypes={allInstanceTypes}
            instanceType={instanceType}
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onSubmitInstanceType}
            vm={vm}
          />
        ))
      }
      promptType={OLSPromptType.CPU_MEMORY}
      subTitle={instanceType && getAnnotation(instanceType, INSTANCETYPE_CLASS_DISPLAY_NAME)}
    />
  );
};

export default WizardInstanceTypeCPUMemory;
