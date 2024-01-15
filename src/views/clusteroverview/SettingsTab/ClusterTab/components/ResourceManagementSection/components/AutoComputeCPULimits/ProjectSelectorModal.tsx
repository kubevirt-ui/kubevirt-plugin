import React, { FC } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-ui/kubevirt-api/console';
import LabelList from '@kubevirt-utils/components/NodeSelectorModal/components/LabelList';
import LabelRow from '@kubevirt-utils/components/NodeSelectorModal/components/LabelRow';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';
import ProjectCheckerAlert from '@kubevirt-utils/components/ProjectCheckerAlert/ProjectCheckerAlert';
import SimpleCopyButton from '@kubevirt-utils/components/SimpleCopyButton/SimpleCopyButton';
import { AUTO_COMPUTE_CPU_LIMITS_LABEL } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceKind, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Button,
  ButtonVariant,
  Form,
  Label,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  Text,
} from '@patternfly/react-core';

import { projectSelectorToIDLabels } from '../../utils/utils';

import './ProjectSelectorModal.scss';

type ProjectSelectorModalProps = {
  isOpen: boolean;
  labels?: { [key: string]: string };
  onClose: () => void;
  onSubmit: (labels: IDLabel[]) => void;
};

const ProjectSelectorModal: FC<ProjectSelectorModalProps> = ({
  isOpen,
  labels,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    entities: selectorLabels,
    onEntityAdd: onLabelAdd,
    onEntityChange: onLabelChange,
    onEntityDelete: onLabelDelete,
  } = useIDEntities<IDLabel>(projectSelectorToIDLabels(labels));

  const [projects, projectsLoaded] = useK8sWatchResource<K8sResourceKind[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  const qualifiedProjects = projects?.filter((project) =>
    selectorLabels.every((label) => project?.metadata?.labels?.[label.key] === label.value),
  );

  const handleSubmit = () => {
    onSubmit(selectorLabels);
    onClose();
  };

  return (
    <Modal
      className="ocs-modal project-selector-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t('Project selector')}
      variant={ModalVariant.small}
    >
      <Stack hasGutter>
        <StackItem>
          <Text className="project-selector-modal__header-text">
            {t('Automatically compute CPU limits on projects containing these labels')}
          </Text>
        </StackItem>
        <StackItem>
          <Label color="grey">{AUTO_COMPUTE_CPU_LIMITS_LABEL}</Label>
          <SimpleCopyButton textToCopy={AUTO_COMPUTE_CPU_LIMITS_LABEL} />
        </StackItem>
        <StackItem>
          <Form>
            <LabelList
              addRowText={t('Add Label to specify qualifying projects')}
              emptyStateAddRowText={t('Add Label to specify qualifying projects')}
              isEmpty={isEmpty(selectorLabels)}
              onLabelAdd={() => onLabelAdd({ id: null, key: '', value: '' })}
            >
              {!isEmpty(selectorLabels) && (
                <>
                  {selectorLabels.map((label) => (
                    <LabelRow
                      key={label.id}
                      label={label}
                      onChange={onLabelChange}
                      onDelete={onLabelDelete}
                    />
                  ))}
                </>
              )}
            </LabelList>
            {projects?.length && (
              <ProjectCheckerAlert
                projectsLoaded={projectsLoaded}
                qualifiedProjects={isEmpty(selectorLabels) ? [] : qualifiedProjects}
              />
            )}
          </Form>
        </StackItem>
        <StackItem>
          <ActionList>
            <ActionListItem>
              <Button
                isDisabled={isEmpty(qualifiedProjects) || isEmpty(selectorLabels)}
                isLoading={!projectsLoaded}
                onClick={handleSubmit}
                variant={ButtonVariant.primary}
              >
                {t('Save')}
              </Button>
            </ActionListItem>
            <ActionListItem>
              <Button onClick={onClose} variant={ButtonVariant.link}>
                {t('Cancel')}
              </Button>
            </ActionListItem>
          </ActionList>
        </StackItem>
      </Stack>
    </Modal>
  );
};

export default ProjectSelectorModal;
