import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceKind, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  pluralize,
  Popover,
} from '@patternfly/react-core';

type ProjectCheckerAlertProps = {
  projectsLoaded: boolean;
  qualifiedProjects: K8sResourceKind[];
};

const ProjectCheckerAlert: FC<ProjectCheckerAlertProps> = ({
  projectsLoaded,
  qualifiedProjects = [],
}) => {
  const { t } = useKubevirtTranslation();
  if (!projectsLoaded) {
    return <Loading />;
  }

  const numQualifiedProjects = qualifiedProjects?.length;
  const matchingProjectText = pluralize(numQualifiedProjects, 'Project');

  return (
    <Alert
      title={
        <>
          {numQualifiedProjects ? (
            <>
              {t('{{matchingProjectText}} matching', {
                matchingProjectText: matchingProjectText,
              })}
            </>
          ) : (
            t('No matching Projects found for the labels')
          )}
        </>
      }
      isInline
      variant={numQualifiedProjects ? AlertVariant.success : AlertVariant.warning}
    >
      {numQualifiedProjects ? (
        <Popover
          bodyContent={
            <>
              {qualifiedProjects?.map((project) => (
                <Flex key={project.metadata.uid}>
                  <FlexItem spacer={{ default: 'spacerXs' }}>
                    <ResourceLink
                      groupVersionKind={modelToGroupVersionKind(ProjectModel)}
                      name={project.metadata.name}
                    />
                  </FlexItem>
                </Flex>
              ))}
            </>
          }
          headerContent={
            <>
              {t('{{qualifiedProjectsCount}} matching Projects found', {
                qualifiedProjectsCount: numQualifiedProjects,
              })}
            </>
          }
        >
          <Button isInline variant={ButtonVariant.link}>
            {t('View matching {{matchingProjectText}}', { matchingProjectText })}
          </Button>
        </Popover>
      ) : (
        t('Scheduling will not be possible at this state')
      )}
    </Alert>
  );
};

export default ProjectCheckerAlert;
