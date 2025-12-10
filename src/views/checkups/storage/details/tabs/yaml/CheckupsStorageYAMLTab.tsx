import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsStorageData from '../../../components/hooks/useCheckupsStorageData';

const CheckupsStorageYAMLTab: FC = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps } = useCheckupsStorageData();

  const configMap = configMaps?.find((cm) => cm.metadata.name === checkupName);

  if (!configMap) {
    return null;
  }

  return <ResourceYAMLEditor initialResource={configMap} />;
};

export default CheckupsStorageYAMLTab;
