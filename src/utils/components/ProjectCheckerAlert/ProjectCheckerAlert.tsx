import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName } from '@kubevirt-utils/resources/shared';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { K8sResourceKind } from '@openshift-console/dynamic-plugin-sdk';
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
                    <MulticlusterResourceLink
                      cluster={getCluster(project)}
                      groupVersionKind={modelToGroupVersionKind(ProjectModel)}
                      name={getName(project)}
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
