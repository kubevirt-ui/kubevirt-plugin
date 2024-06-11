import React, { FC } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Stack } from '@patternfly/react-core';
import { CheckIcon, TimesIcon } from '@patternfly/react-icons';

type SimplifiedSysprepDescriptionProps = {
  hasAutoUnattend: boolean;
  hasUnattend: boolean;
  selectedSysprepName?: string;
  shouldCreateNewConfigMap: boolean;
};

const SimplifiedSysprepDescription: FC<SimplifiedSysprepDescriptionProps> = ({
  hasAutoUnattend,
  hasUnattend,
  selectedSysprepName,
  shouldCreateNewConfigMap,
}) => {
  const { t } = useKubevirtTranslation();

  if (!shouldCreateNewConfigMap) {
    return (
      <ResourceLink
        groupVersionKind={modelToGroupVersionKind(ConfigMapModel)}
        linkTo={false}
        name={selectedSysprepName}
      />
    );
  }

  return (
    <Stack hasGutter>
      <VirtualMachineDescriptionItem
        descriptionData={hasAutoUnattend ? <CheckIcon /> : <TimesIcon />}
        descriptionHeader={t('Autounattend.xml')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={hasUnattend ? <CheckIcon /> : <TimesIcon />}
        descriptionHeader={t('Unattend.xml')}
      />
    </Stack>
  );
};

export default SimplifiedSysprepDescription;
