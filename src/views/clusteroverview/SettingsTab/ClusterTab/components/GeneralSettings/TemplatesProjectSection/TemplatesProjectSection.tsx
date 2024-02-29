import React, { FC, useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import CreateProjectModal from '@kubevirt-utils/components/CreateProjectModal/CreateProjectModal';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  MenuFooter,
  Skeleton,
  Spinner,
  Text,
  TextVariants,
} from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';

import {
  getCurrentTemplatesNamespaceFromHCO,
  OPENSHIFT,
  updateHCOCommonTemplatesNamespace,
} from './utils/utils';

import './templates-project-section.scss';

type TemplatesProjectSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
};

const TemplatesProjectSection: FC<TemplatesProjectSectionProps> = ({
  hyperConvergeConfiguration,
}) => {
  const { t } = useKubevirtTranslation();
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

  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;

  useEffect(() => {
    if (hyperConverge) {
      const currentNamespaceHCO = getCurrentTemplatesNamespaceFromHCO(hyperConverge);
      !selectedProject && setSelectedProject(currentNamespaceHCO ?? OPENSHIFT);
    }
  }, [hyperConverge, selectedProject]);

  const onSelect = (value: string) => {
    setSelectedProject(value);
    updateHCOCommonTemplatesNamespace(hyperConverge, value, setError, setLoading).catch((e) =>
      kubevirtConsole.log(e),
    );
  };

  return (
    <ExpandSection className="templates-project-tab__main" toggleText={t('Template project')}>
      <Text className="templates-project-tab__main--help" component={TextVariants.small}>
        <Trans ns="plugin__kubevirt-plugin" t={t}>
          Select a project for Red Hat templates. The default project is &apos;openshift&apos;. If
          you want to store Red Hat templates in multiple projects, you must clone
          <br />
          the Red Hat template by selecting <b>Clone template</b> from the template action menu and
          then selecting another project for the cloned template.
        </Trans>
      </Text>
      <Text className="templates-project-tab__main--field-title" component={TextVariants.h6}>
        {t('Project')}
      </Text>
      {projectsLoaded && hyperLoaded ? (
        <InlineFilterSelect
          menuFooter={
            <MenuFooter>
              <Button
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
                key="create-project"
                variant={ButtonVariant.secondary}
              >
                {t('Create project')}
              </Button>
            </MenuFooter>
          }
          options={[
            ...projects?.map((proj) => ({
              groupVersionKind: modelToGroupVersionKind(ProjectModel),
              value: getName(proj),
            })),
          ]}
          toggleProps={{
            icon: loading && <Spinner size="sm" />,
            isDisabled: loading,
            placeholder: t('Search project'),
          }}
          selected={selectedProject}
          setSelected={onSelect}
        />
      ) : (
        <Skeleton width={'300px'} />
      )}
      {(error || projectsLoadingError) && (
        <Alert
          className="templates-project-tab__main--error"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {error || projectsLoadingError}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default TemplatesProjectSection;
