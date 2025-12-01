import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsNetworkData from '../../../hooks/useCheckupsNetworkData';

const CheckupsNetworkYAMLTab: FC = () => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const { configMaps } = useCheckupsNetworkData();

  const configMap = configMaps.find((cm) => cm.metadata.name === checkupName);

  return <ResourceYAMLEditor initialResource={configMap} />;
};

export default CheckupsNetworkYAMLTab;
