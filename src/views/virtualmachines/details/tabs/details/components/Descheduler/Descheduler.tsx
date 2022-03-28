import * as React from 'react';

import { modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import KubeDeschedulerModel from '@kubevirt-ui/kubevirt-api/console/models/KubeDeschedulerModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_EVICT_LABEL } from '@kubevirt-utils/resources/vmi';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type DeschedulerProps = {
  vm: V1VirtualMachine;
};

const Descheduler: React.FC<DeschedulerProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const deschedulerLabel =
    vm?.spec?.template?.metadata?.annotations?.[DESCHEDULER_EVICT_LABEL] === 'true';
  const [resourceList] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(KubeDeschedulerModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
  });

  const isVMdeschedulerOn = resourceList?.length > 0 && deschedulerLabel;

  return isVMdeschedulerOn ? t('ON') : t('OFF');
};

export default Descheduler;
