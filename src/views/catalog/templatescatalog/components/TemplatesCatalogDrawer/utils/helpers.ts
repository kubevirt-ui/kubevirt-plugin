import {
  ProcessedTemplatesModel,
  StorageClassModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiStorageV1StorageClassList } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/DiskFormFields/utils/helpers';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import {
  LABEL_USED_TEMPLATE_NAME,
  LABEL_USED_TEMPLATE_NAMESPACE,
} from '@kubevirt-utils/resources/template';
import { getDataVolumeTemplates, getMemoryCPU } from '@kubevirt-utils/resources/vm';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sCreate, k8sGet } from '@openshift-console/dynamic-plugin-sdk';

export const shouldApplyInitialStorageClass = async (vm: V1VirtualMachine): Promise<string> => {
  const vmSCExists = getDataVolumeTemplates(vm)?.some(
    (dvt) => !!dvt?.spec?.storage?.storageClassName,
  );
  if (vmSCExists) return null;

  const storageClasses = await k8sGet<IoK8sApiStorageV1StorageClassList>({
    model: StorageClassModel,
  });

  const defaultSC = storageClasses?.items?.find((item) => isDefaultStorageClass(item));

  return isEmpty(defaultSC) ? getName(storageClasses?.items[0]) : null;
};

export const applyCPUMemory = (draftVM: V1VirtualMachine, contextVM: V1VirtualMachine) => {
  ensurePath(draftVM, ['spec.template.spec.domain.cpu', 'spec.template.spec.domain.memory.guest']);

  const { cpu, memory } = getMemoryCPU(contextVM);
  draftVM.spec.template.spec.domain.cpu.cores = cpu?.cores;
  draftVM.spec.template.spec.domain.memory.guest = memory;
};

export const applyTemplateMetadataToVM = (draftVM: V1VirtualMachine, template: V1Template) => {
  draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAME] = getName(template);
  draftVM.metadata.labels[LABEL_USED_TEMPLATE_NAMESPACE] = getNamespace(template);
};

export const processTemplate = (template: V1Template, namespace: string) =>
  k8sCreate<V1Template>({
    data: { ...template, metadata: { ...template?.metadata, namespace } },
    model: ProcessedTemplatesModel,
    ns: namespace,
    queryParams: {
      dryRun: 'All',
    },
  });
