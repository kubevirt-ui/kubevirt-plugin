import React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  convertYAMLUserDataObject,
  getCloudInitData,
  getCloudInitVolume,
} from '@kubevirt-utils/components/CloudinitModal/utils/cloudinit-utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import CloudInitInfoHelper from './CloudinitInfoHelper';

export const CloudInitDescription: React.FC<{ vm: V1VirtualMachine }> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const cloudInitData = getCloudInitData(getCloudInitVolume(vm));
  const userData = convertYAMLUserDataObject(cloudInitData?.userData);

  return (
    <Stack hasGutter>
      <StackItem>
        <CloudInitInfoHelper />
      </StackItem>
      <StackItem>
        <DescriptionList columnModifier={{ lg: '1Col', xl: '3Col' }} isCompact>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('User')}</DescriptionListTerm>
            <DescriptionListDescription>{userData?.user || '-'}</DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Password')}</DescriptionListTerm>
            <DescriptionListDescription>
              {userData?.password?.replace(/./g, '*') || '-'}
            </DescriptionListDescription>
          </DescriptionListGroup>
          <DescriptionListGroup>
            <DescriptionListTerm>{t('Network data')}</DescriptionListTerm>
            <DescriptionListDescription>
              {cloudInitData?.networkData ? t('Custom') : t('Default')}
            </DescriptionListDescription>
          </DescriptionListGroup>
        </DescriptionList>
      </StackItem>
    </Stack>
  );
};
