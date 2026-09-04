import React, { type FC } from 'react';

import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import '../../../TopologyVMDetailsPanel.scss';

type VMPodDetailsItemProps = {
  pod?: IoK8sApiCoreV1Pod | null;
};

const VMPodDetailsItem: FC<VMPodDetailsItemProps> = ({ pod }) => {
  const { t } = useKubevirtTranslation();

  const launcherPodName = getName(pod);

  return (
    <DescriptionItem
      className="topology-vm-details-panel__item"
      descriptionData={
        launcherPodName ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PodModel)}
            name={launcherPodName}
            namespace={getNamespace(pod)}
          />
        ) : (
          NO_DATA_DASH
        )
      }
      descriptionHeader={t('Pod')}
    />
  );
};

export default VMPodDetailsItem;
