import React, { FC, ReactNode, useEffect, useState } from 'react';

import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Content, ContentVariants } from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';
import GeneralSettingsError from '../shared/GeneralSettingsError';
import GeneralSettingsProjectSelector from '../shared/GeneralSettingsProjectSelector';

import '../shared/general-settings.scss';

type GeneralSettingsProjectProps = {
  description: ReactNode;
  hcoResourceNamespace: string;
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  namespace: string;
  onChange: (
    hyperConverged: HyperConverged,
    newNamespace: null | number | string,
    handelError: (value: string) => void,
    handleLoading: (value: boolean) => void,
  ) => void;
  projectsData: [projects: K8sResourceCommon[], loaded: boolean, error: any];
  toggleText: string;
};

const GeneralSettingsProject: FC<GeneralSettingsProjectProps> = ({
  description,
  hcoResourceNamespace,
  hyperConvergeConfiguration,
  namespace,
  onChange,
  projectsData,
  toggleText,
}) => {
  const { t } = useKubevirtTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>();
  const [error, setError] = useState<string>();

  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const [projects, projectsLoaded, projectsLoadingError] = projectsData;

  useEffect(() => {
    if (hyperConverge) {
      !selectedProject && setSelectedProject(hcoResourceNamespace ?? namespace);
    }
  }, [hcoResourceNamespace, hyperConverge, namespace, selectedProject]);

  const onSelect = (value: string) => {
    setError(null);
    setSelectedProject(value);
    onChange(hyperConverge, value, setError, setLoading);
  };

  return (
    <ExpandSection className="project-tab__main" toggleText={toggleText}>
      <Content className="project-tab__main--help" component={ContentVariants.small}>
        {description}
      </Content>
      <Content className="project-tab__main--field-title" component={ContentVariants.h6}>
        {t('Project')}
      </Content>
      <GeneralSettingsProjectSelector
        loaded={!loading && hyperLoaded && projectsLoaded}
        onSelect={onSelect}
        projects={projects}
        selectedProject={selectedProject}
      />
      <GeneralSettingsError error={error} loading={projectsLoadingError} />
    </ExpandSection>
  );
};

export default GeneralSettingsProject;
