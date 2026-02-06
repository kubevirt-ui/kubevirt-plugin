import React, { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useProjectResources from '@kubevirt-utils/hooks/useProjectResources';
import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import { getName } from '@kubevirt-utils/resources/shared';
import { ResourceIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  List,
  ListItem,
  Popover,
} from '@patternfly/react-core';

import { getVMNetworkProjects } from '../../utils';
import { VMNetworkForm } from '../constants';

const SelectedProjects: FC = () => {
  const { t } = useKubevirtTranslation();

  const { watch } = useFormContext<VMNetworkForm>();

  const vmNetwork = watch('network');

  const [projects] = useProjectResources();

  const matchingProjects = getVMNetworkProjects(vmNetwork, projects);
  const projectsCount = matchingProjects.length;

  return (
    <Alert
      title={
        projectsCount === 1
          ? t('1 project selected')
          : t('{{projectsCount}} projects selected', { projectsCount })
      }
      variant={projectsCount === 0 ? AlertVariant.warning : AlertVariant.success}
    >
      {projectsCount === 0 ? (
        t('No projects selected')
      ) : (
        <Popover
          bodyContent={
            <List>
              {matchingProjects?.map((project) => (
                <ListItem key={getName(project)}>
                  <ResourceIcon groupVersionKind={modelToGroupVersionKind(ProjectModel)} />
                  {getName(project)}
                </ListItem>
              ))}
            </List>
          }
        >
          <Button isInline variant={ButtonVariant.link}>
            {t('View selected projects')}
          </Button>
        </Popover>
      )}
    </Alert>
  );
};

export default SelectedProjects;
