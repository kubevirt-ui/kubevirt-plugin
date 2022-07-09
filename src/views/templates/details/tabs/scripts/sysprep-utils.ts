import { produceVMDisks } from '@catalog/utils/WizardVMContext';
import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SYSPREP, sysprepDisk } from '@kubevirt-utils/components/SysprepModal/sysprep-utils';
import {
  getTemplateVirtualMachineObject,
  replaceTemplateVM,
} from '@kubevirt-utils/resources/template';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';

const addSysprepConfig = (draftVM: V1VirtualMachine, newSysprepName: string) => {
  getVolumes(draftVM).push({
    sysprep: {
      configMap: { name: newSysprepName },
    },
    name: SYSPREP,
  });
  getDisks(draftVM).push(sysprepDisk());
};

const removeSysprepConfig = (draftVM: V1VirtualMachine, sysprepVolumeName: string) => {
  draftVM.spec.template.spec.volumes = getVolumes(draftVM).filter(
    (volume) => sysprepVolumeName !== volume.name,
  );
  draftVM.spec.template.spec.domain.devices.disks = getDisks(draftVM).filter(
    (disk) => sysprepVolumeName !== disk.name,
  );
};

export const updateTemplateSysprep = async (
  template: V1Template,
  newSysprepName: string | undefined,
  oldSysprepName: string | undefined,
) => {
  if (newSysprepName === oldSysprepName) return;

  const vm = getTemplateVirtualMachineObject(template);

  const newVM = produceVMDisks(vm, (draftVM) => {
    const sysprepVolume = getVolumes(draftVM).find((volume) => volume?.sysprep?.configMap?.name);

    if (sysprepVolume && newSysprepName) {
      sysprepVolume.sysprep.configMap.name = newSysprepName;

      return;
    }

    if (sysprepVolume && !newSysprepName) {
      removeSysprepConfig(draftVM, sysprepVolume.name);

      return;
    }

    if (newSysprepName) {
      addSysprepConfig(draftVM, newSysprepName);

      return;
    }
  });

  const updatedTemplate = replaceTemplateVM(template, newVM);

  await k8sUpdate({
    model: TemplateModel,
    data: updatedTemplate,
    ns: template?.metadata?.namespace,
    name: template?.metadata?.name,
  });
};
