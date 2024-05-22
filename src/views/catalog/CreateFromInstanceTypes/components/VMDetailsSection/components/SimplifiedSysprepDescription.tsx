import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

type SimplifiedSysprepDescriptionProps = {
  hasAutoUnattend: boolean;
  hasUnattend: boolean;
  selectedSysprepName?: string;
};

const SimplifiedSysprepDescription: FC<SimplifiedSysprepDescriptionProps> = ({
  hasAutoUnattend,
  hasUnattend,
  selectedSysprepName,
}) => {
  const { t } = useKubevirtTranslation();

  if (selectedSysprepName) {
    return (
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
        linkTo={false}
        name={selectedSysprepName}
      />
    );
  }

  return (
    <>
      <VirtualMachineDescriptionItem
        descriptionData={hasAutoUnattend ? t('Available') : t('Not available')}
        descriptionHeader={t('Autounattend.xml answer file')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={hasUnattend ? t('Available') : t('Not available')}
        descriptionHeader={t('Unattend.xml answer file')}
      />
    </>
  );
};

export default SimplifiedSysprepDescription;
