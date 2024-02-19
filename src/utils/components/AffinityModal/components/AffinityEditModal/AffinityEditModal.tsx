import React, { Dispatch, FC, SetStateAction } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ActionGroup, Button, ButtonVariant, Modal, ModalVariant } from '@patternfly/react-core';

import { getIntersectedQualifiedNodes } from '../../utils/helpers';
import { AffinityLabel, AffinityRowData } from '../../utils/types';

import AffinityForm from './AffinityForm/AffinityForm';
import { useNodeFieldQualifier } from './hooks/useNodeFieldQualifier';
import { useNodeLabelQualifier } from './hooks/useNodeLabelQualifier';

type AffinityEditModalProps = {
  focusedAffinity: AffinityRowData;
  isOpen: boolean;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  onCancel: () => void;
  onSubmit: (affinity: AffinityRowData) => void;
  setFocusedAffinity: Dispatch<SetStateAction<AffinityRowData>>;
  title: string;
};

const AffinityEditModal: FC<AffinityEditModalProps> = ({
  focusedAffinity,
  isOpen,
  nodes,
  nodesLoaded,
  onCancel,
  onSubmit,
  setFocusedAffinity,
  title,
}) => {
  const { t } = useKubevirtTranslation();

  const [isDisabled, setIsDisabled] = React.useState(false);
  const expressions = useIDEntities<AffinityLabel>(focusedAffinity?.expressions);
  const fields = useIDEntities<AffinityLabel>(focusedAffinity?.fields);

  const qualifiedExpressionNodes = useNodeLabelQualifier(nodes, nodesLoaded, expressions?.entities);
  const qualifiedFieldNodes = useNodeFieldQualifier(nodes, nodesLoaded, fields?.entities);
  return (
    <Modal
      footer={
        <ActionGroup>
          <Button
            onClick={() =>
              onSubmit({
                ...focusedAffinity,
                expressions: expressions?.entities,
                fields: fields?.entities,
              })
            }
            isDisabled={isDisabled}
            variant={ButtonVariant.primary}
          >
            {t('Save affinity rule')}
          </Button>
          <Button onClick={onCancel} size="sm" variant="link">
            {t('Cancel')}
          </Button>
        </ActionGroup>
      }
      className="ocs-modal co-catalog-page__overlay"
      isOpen={isOpen}
      onClose={onCancel}
      position="top"
      title={title}
      variant={ModalVariant.medium}
    >
      <AffinityForm
        qualifiedNodes={getIntersectedQualifiedNodes({
          expressionNodes: qualifiedExpressionNodes,
          expressions: expressions?.entities,
          fieldNodes: qualifiedFieldNodes,
          fields: fields?.entities,
        })}
        expressions={expressions}
        fields={fields}
        focusedAffinity={focusedAffinity}
        isSubmitDisabled={isDisabled}
        nodesLoaded={nodesLoaded}
        setFocusedAffinity={setFocusedAffinity}
        setSubmitDisabled={setIsDisabled}
      />
    </Modal>
  );
};

export default AffinityEditModal;
