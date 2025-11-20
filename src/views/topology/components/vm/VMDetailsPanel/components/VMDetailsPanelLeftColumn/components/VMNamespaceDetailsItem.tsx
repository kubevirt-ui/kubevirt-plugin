import React, { FC } from 'react';

import { NamespaceModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace, getUID } from '@kubevirt-utils/resources/shared';
import { getGroupVersionKindForModel, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import '../../../TopologyVMDetailsPanel.scss';

type VMNamespaceDetailsItemProps = {
  vm: V1VirtualMachine;
};

const VMNamespaceDetailsItem: FC<VMNamespaceDetailsItemProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();

  const vmNamespace = getNamespace(vm);
  if (!vmNamespace) return null;

  return (
    <DescriptionItem
      descriptionData={
        <ResourceLink
          groupVersionKind={getGroupVersionKindForModel(NamespaceModel)}
          name={vmNamespace}
          namespace={null}
          title={getUID(vm)}
        />
      }
      className="topology-vm-details-panel__item"
      descriptionHeader={<span>{t('Namespace')}</span>}
    />
  );
};

export default VMNamespaceDetailsItem;
