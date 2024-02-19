import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { DescriptionList, Stack, StackItem } from '@patternfly/react-core';

import VirtualMachineDescriptionItem from '../VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';

import CloudInitInfoHelper from './CloudinitInfoHelper';

export const CloudInitDescription: FC<{ vm: V1VirtualMachine }> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const cloudInitData = getCloudInitData(getCloudInitVolume(vm));
  const userData = convertYAMLUserDataObject(cloudInitData?.userData);

  return (
    <Stack hasGutter>
      <StackItem>
        <CloudInitInfoHelper />
      </StackItem>
      <StackItem>
        <DescriptionList
          className="pf-c-description-list"
          columnModifier={{ lg: '1Col', xl: '3Col' }}
          isCompact
        >
          <VirtualMachineDescriptionItem
            descriptionData={userData?.user || NO_DATA_DASH}
            descriptionHeader={t('User')}
          />
          <VirtualMachineDescriptionItem
            descriptionData={userData?.password?.toString().replace(/./g, '*') || NO_DATA_DASH}
            descriptionHeader={t('Password')}
          />
          <VirtualMachineDescriptionItem
            descriptionData={cloudInitData?.networkData ? t('Custom') : t('Default')}
            descriptionHeader={t('Network data')}
          />
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
