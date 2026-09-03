import React, { type FC } from 'react';
import { useParams } from 'react-router';

import { getName } from '@kubevirt-utils/resources/shared';
import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsStorageData from '../../../components/hooks/useCheckupsStorageData';

const CheckupsStorageYAMLTab: FC = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps } = useCheckupsStorageData();

  const configMap = configMaps?.find((configMapItem) => getName(configMapItem) === checkupName);

  if (!configMap) {
    return null;
  }

  return <ResourceYAMLEditor initialResource={configMap} />;
};

export default CheckupsStorageYAMLTab;
