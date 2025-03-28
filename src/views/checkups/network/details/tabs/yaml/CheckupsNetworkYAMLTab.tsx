import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsNetworkData from '../../../hooks/useCheckupsNetworkData';

const CheckupsNetworkYAMLTab: FC = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { configMaps } = useCheckupsNetworkData();

  const configMap = configMaps.find((cm) => cm.metadata.name === vmName);

  return <ResourceYAMLEditor initialResource={configMap} />;
};

export default CheckupsNetworkYAMLTab;
