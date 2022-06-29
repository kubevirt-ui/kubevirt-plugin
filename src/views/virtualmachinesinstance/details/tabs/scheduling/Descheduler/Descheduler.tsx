import * as React from 'react';

import KubeDeschedulerModel from '@kubevirt-ui/kubevirt-api/console/models/KubeDeschedulerModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type DeschedulerProps = {
  vmi: V1VirtualMachineInstance;
};

const Descheduler: React.FC<DeschedulerProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const deschedulerLabel = Boolean(vmi?.metadata?.annotations[DESCHEDULER_EVICT_LABEL]);
  const [resourceList] = useK8sWatchResource<K8sResourceCommon[]>({
    kind: KubeDeschedulerModel.kind,
    isList: true,
  });

  const isVMdeschedulerOn = resourceList?.length > 0 && deschedulerLabel;

  return isVMdeschedulerOn ? t('ON') : t('OFF');
};

export default Descheduler;
