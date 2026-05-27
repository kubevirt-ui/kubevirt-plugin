import React, { FC, ReactNode, useEffect, useState } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useSettingsCluster } from '@settings/context/SettingsClusterContext';
import ExpandSection from '@settings/ExpandSection/ExpandSection';

import GeneralSettingsError from './GeneralSettingsError';
import GeneralSettingsNamespaceSelector from '../shared/GeneralSettingsNamespaceSelector';

import '../shared/general-settings.scss';

type GeneralSettingsNamespaceProps = {
  description: ReactNode;
  hcoResourceNamespace: string;
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  namespace: string;
  onChange: (
    hyperConverged: HyperConverged,
    newNamespace: null | number | string,
    handelError: (value: string) => void,
    handleLoading: (value: boolean) => void,
    cluster?: string,
  ) => void;
  namespacesData: [namespaces: K8sResourceCommon[], loaded: boolean, error: any];
  searchItemId?: string;
  toggleText: string;
};

const GeneralSettingsNamespace: FC<GeneralSettingsNamespaceProps> = ({
  description,
  hcoResourceNamespace,
  hyperConvergeConfiguration,
  namespace,
  onChange,
  namespacesData,
  searchItemId,
  toggleText,
}) => {
  const { t } = useKubevirtTranslation();
  const cluster = useSettingsCluster();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedNamespace, setSelectedNamespace] = useState<string>();
  const [error, setError] = useState<string>();

  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const [namespaces, namespacesLoaded, namespacesLoadingError] = namespacesData;

  useEffect(() => {
    if (hyperConverge) {
      setSelectedNamespace(hcoResourceNamespace ?? namespace);
    }
  }, [hcoResourceNamespace, hyperConverge, namespace]);

  const onSelect = (value: string) => {
    setError(null);
    setSelectedNamespace(value);
    onChange(hyperConverge, value, setError, setLoading, cluster);
  };

  return (
    <ExpandSection
      className="namespace-tab__main"
      searchItemId={searchItemId}
      toggleText={toggleText}
    >
      <Content className="namespace-tab__main--help" component={ContentVariants.small}>
        {description}
      </Content>
      <Content className="namespace-tab__main--field-title" component={ContentVariants.h6}>
        {t('Namespace')}
      </Content>
      <GeneralSettingsNamespaceSelector
        loaded={!loading && hyperLoaded && namespacesLoaded}
        onSelect={onSelect}
        namespaces={namespaces}
        selectedNamespace={selectedNamespace}
      />
      <GeneralSettingsError error={error} loadingError={namespacesLoadingError} />
    </ExpandSection>
  );
};

export default GeneralSettingsNamespace;
