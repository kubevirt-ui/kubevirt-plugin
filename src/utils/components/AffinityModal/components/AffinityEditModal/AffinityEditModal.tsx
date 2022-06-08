import * as React from 'react';

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
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (affinity: AffinityRowData) => void;
  focusedAffinity: AffinityRowData;
  setFocusedAffinity: React.Dispatch<React.SetStateAction<AffinityRowData>>;
  title: string;
};

const AffinityEditModal: React.FC<AffinityEditModalProps> = ({
  nodes,
  nodesLoaded,
  isOpen,
  onCancel,
  onSubmit,
  focusedAffinity,
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
      variant={ModalVariant.medium}
      className="ocs-modal co-catalog-page__overlay"
      position="top"
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={
        <ActionGroup>
          <Button
            isDisabled={isDisabled}
            onClick={() =>
              onSubmit({
                ...focusedAffinity,
                expressions: expressions?.entities,
                fields: fields?.entities,
              })
            }
            variant={ButtonVariant.primary}
          >
            {t('Save affinity rule')}
          </Button>
          <Button isSmall onClick={onCancel} variant="link">
            {t('Cancel')}
          </Button>
        </ActionGroup>
      }
    >
      <AffinityForm
        focusedAffinity={focusedAffinity}
        setFocusedAffinity={setFocusedAffinity}
        isSubmitDisabled={isDisabled}
        setSubmitDisabled={setIsDisabled}
        expressions={expressions}
        fields={fields}
        qualifiedNodes={getIntersectedQualifiedNodes({
          expressionNodes: qualifiedExpressionNodes,
          fieldNodes: qualifiedFieldNodes,
          expressions: expressions?.entities,
          fields: fields?.entities,
        })}
        nodesLoaded={nodesLoaded}
      />
    </Modal>
  );
};

export default AffinityEditModal;
