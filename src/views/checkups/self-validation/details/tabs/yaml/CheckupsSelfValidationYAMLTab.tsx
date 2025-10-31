import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ResourceYAMLEditor } from '@openshift-console/dynamic-plugin-sdk';

import useCheckupsSelfValidationData from '../../../components/hooks/useCheckupsSelfValidationData';

const CheckupsSelfValidationYAMLTab: FC = () => {
  const { vmName } = useParams<{ vmName: string }>();
  const { configMaps } = useCheckupsSelfValidationData();

  const configMap = configMaps.find((cm) => cm.metadata.name === vmName);

  return <ResourceYAMLEditor initialResource={configMap} readOnly />;
};

export default CheckupsSelfValidationYAMLTab;
