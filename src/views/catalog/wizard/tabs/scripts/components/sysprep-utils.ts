import { WizardVMContextType } from '@catalog/utils/WizardVMContext';
import { ConfigMapModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  generateNewSysprepConfig,
  removeSysprepConfig,
} from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import { getVolumes } from '@kubevirt-utils/resources/vm';

export const isSysprepConfig = (name: string) => (object) =>
  object?.metadata?.name === name && object?.kind === ConfigMapModel.kind;

export const editSysprepObject = (
  updateTabsData: WizardVMContextType['updateTabsData'],
  sysprepName: string,
  sysprepData: IoK8sApiCoreV1ConfigMap['data'],
) => {
  updateTabsData((tabsDraft) => {
    const sysprepToEdit = tabsDraft?.additionalObjects?.find(
      (object) => object?.metadata?.name === sysprepName,
    ) as IoK8sApiCoreV1ConfigMap;

    sysprepToEdit.data = sysprepData;
  });
};

export const pushSysprepObject = (
  vm: V1VirtualMachine,
  updateTabsData: WizardVMContextType['updateTabsData'],
  sysprepData: IoK8sApiCoreV1ConfigMap['data'],
  sysprepName: string,
) => {
  updateTabsData((tabsDraft) => {
    if (!tabsDraft?.additionalObjects) tabsDraft.additionalObjects = [];

    tabsDraft.additionalObjects.push(generateNewSysprepConfig({ data: sysprepData, sysprepName }));
  });
};

export const removeSysprepObject = (
  updateVM: WizardVMContextType['updateVM'],
  updateTabsData: WizardVMContextType['updateTabsData'],
  sysprepName: string,
) => {
  const filterSysprepByName = isSysprepConfig(sysprepName);

  updateTabsData((tabsDraft) => {
    tabsDraft.additionalObjects = (tabsDraft?.additionalObjects || []).filter(
      (object) => !filterSysprepByName(object),
    );
  });

  return updateVM((vmDraft) => {
    const sysprepVolume = getVolumes(vmDraft).find((volume) => volume?.sysprep?.configMap?.name);
    removeSysprepConfig(vmDraft, sysprepVolume.name);
  });
};
