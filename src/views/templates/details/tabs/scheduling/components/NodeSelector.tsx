import React from 'react';
import { TemplateSchedulingGridProps } from 'src/views/templates/details/tabs/scheduling/components/TemplateSchedulingLeftGrid';
import { getNodeSelector } from 'src/views/templates/utils/selectors';

import { TemplateModel, V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  Text,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import NodeSelectorModal from './NodeSelectorModal';

const NodeSelector: React.FC<TemplateSchedulingGridProps> = ({ template, editable }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const nodeSelector = getNodeSelector(template);
  const nodeSelectorLabels = !isEmpty(nodeSelector) ? (
    <LabelGroup defaultIsOpen>
      {Object.entries(nodeSelector)?.map(([key, value]) => (
        <Label key={key}>{`${key}=${value}`}</Label>
      ))}
    </LabelGroup>
  ) : (
    t('No selector')
  );

  const onSubmit = React.useCallback(
    (updatedTemplate: V1Template) =>
      k8sUpdate({
        model: TemplateModel,
        data: updatedTemplate,
        ns: updatedTemplate?.metadata?.namespace,
        name: updatedTemplate?.metadata?.name,
      }),
    [],
  );

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <NodeSelectorModal
        template={template}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Node selector')}</DescriptionListTerm>
      <DescriptionListDescription>
        {editable ? (
          <Button type="button" isInline onClick={onEditClick} variant="link">
            {nodeSelectorLabels}
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        ) : (
          <Text className="text-muted">{nodeSelectorLabels}</Text>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default NodeSelector;
