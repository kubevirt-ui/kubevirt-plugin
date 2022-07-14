import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import {
  HyperConvergedModelGroupVersionKind,
  modelToGroupVersionKind,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  ResourceLink,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Select,
  SelectOption,
  SelectVariant,
  Skeleton,
  Spinner,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import { HyperConverged } from '../../utils/types';
import { getHyperConvergedObject } from '../../utils/utils';

import {
  getCurrentTemplatesNamespaceFromHCO,
  OPENSHIFT,
  updateHCOCommonTemplatesNamespace,
} from './utils/utils';

import './templates-project-tab.scss';

const TemplatesProjectTab = () => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>();
  const [error, setError] = useState<string>();
  const { createModal } = useModal();

  const [projects, projectsLoaded, projectsLoadingError] = useK8sWatchResource<K8sResourceCommon[]>(
    {
      groupVersionKind: modelToGroupVersionKind(ProjectModel),
      isList: true,
    },
  );

  const [hyperConvergeData, hyperLoaded, hyperLoadingError] = useK8sWatchResource<HyperConverged[]>(
    {
      groupVersionKind: HyperConvergedModelGroupVersionKind,
      isList: true,
    },
  );

  useEffect(() => {
    const hyperConvergeObject = getHyperConvergedObject(hyperConvergeData);
    if (hyperConvergeObject) {
      const currentNamespaceHCO = getCurrentTemplatesNamespaceFromHCO(hyperConvergeObject);
      !selectedProject && setSelectedProject(currentNamespaceHCO ?? OPENSHIFT);
    }
  }, [hyperConvergeData, selectedProject]);

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
    value: string,
  ) => {
    setIsOpen(false);
    setSelectedProject(value);
    updateHCOCommonTemplatesNamespace(
      getHyperConvergedObject(hyperConvergeData),
      value,
      setError,
      setLoading,
    ).catch((e) => console.log(e));
  };

  const onFilter = (_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    const filteredProjects = projects.filter((project) => project?.metadata?.name?.includes(value));
    return filteredProjects?.map((project) => (
      <SelectOption key={project?.metadata?.name} value={project?.metadata?.name}>
        <ResourceLink kind={ProjectModel.kind} name={project?.metadata?.name} linkTo={false} />
      </SelectOption>
    ));
  };

  return (
    <div className="templates-project-tab__main">
      <Text component={TextVariants.small} className="templates-project-tab__main--help">
        <Trans t={t} ns="plugin__kubevirt-plugin">
          Set the project to nest Red Hat templates in. If a project is not selected, the settings
          defaults to &apos;openshift&apos;.
          <br />
          To nest Red Hat templates in more than one project, use the clone template action from the
          Templates kebab actions.
        </Trans>
      </Text>
      <Text component={TextVariants.h6} className="templates-project-tab__main--field-title">
        {t('Project')}
      </Text>
      {projectsLoaded && hyperLoaded ? (
        <Select
          id="project"
          isOpen={isOpen}
          isDisabled={loading}
          toggleIcon={loading && <Spinner isSVG size="sm" />}
          onToggle={setIsOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          onFilter={onFilter}
          hasInlineFilter
          selections={selectedProject}
          maxHeight={400}
          width={300}
          inlineFilterPlaceholderText={t('Search project')}
          footer={
            <Button
              variant={ButtonVariant.secondary}
              onClick={() =>
                createModal((props) => (
                  <CreateProjectModal
                    {...props}
                    createdProject={(value) =>
                      value?.metadata?.name && setSelectedProject(value?.metadata?.name)
                    }
                  />
                ))
              }
            >
              {t('Create project')}
            </Button>
          }
        >
          {projects?.map((project) => (
            <SelectOption key={project?.metadata?.name} value={project?.metadata?.name}>
              <ResourceLink
                kind={ProjectModel.kind}
                name={project?.metadata?.name}
                linkTo={false}
              />
            </SelectOption>
          ))}
        </Select>
      ) : (
        <Skeleton width={'300px'} />
      )}
      {(error || projectsLoadingError || hyperLoadingError) && (
        <Alert
          title={t('Error')}
          isInline
          variant={AlertVariant.danger}
          className="templates-project-tab__main--error"
        >
          {error || projectsLoadingError || hyperLoadingError}
        </Alert>
      )}
    </div>
  );
};

export default TemplatesProjectTab;
