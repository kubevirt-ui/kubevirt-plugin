import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import KubeDeschedulerModel from '@kubevirt-ui/kubevirt-api/console/models/KubeDeschedulerModel';
import { TEMPLATE_TYPE_BASE, TEMPLATE_TYPE_LABEL } from '@kubevirt-utils/resources/template';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const isCommonVMTemplate = (template: V1Template): boolean =>
  template?.metadata?.labels?.[TEMPLATE_TYPE_LABEL] === TEMPLATE_TYPE_BASE;

export const isDedicatedCPUPlacement = (template: V1Template): boolean =>
  template?.objects[0]?.spec?.template?.spec?.domain?.cpu?.dedicatedCpuPlacement;

export const useDeschedulerInstalled = (): boolean => {
  // check if the Descheduler is installed
  const [resourceList] = useK8sWatchResource<any>({
    kind: KubeDeschedulerModel.kind,
    isList: true,
  });
  return resourceList.length > 0;
};

// check if the descheduler is ON
export const isDeschedulerOn = (template: V1Template): boolean =>
  // check for the descheduler.alpha.kubernetes.io/evict: 'true' annotation
  template?.objects[0]?.spec?.template?.metadata?.annotations[DESCHEDULER_EVICT_LABEL] === 'true';
