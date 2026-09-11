import type { Dispatch, FC, SetStateAction } from 'react';
import { useState } from 'react';

import type { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useIDEntities } from '@kubevirt-utils/components/NodeSelectorModal/hooks/useIDEntities';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import { getIntersectedQualifiedNodes } from '../../utils/helpers';
import type { AffinityLabel, AffinityRowData } from '../../utils/types';
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

  const [isDisabled, setIsDisabled] = useState(false);
  const expressions = useIDEntities<AffinityLabel>(focusedAffinity?.expressions);
  const fields = useIDEntities<AffinityLabel>(focusedAffinity?.fields);

  const qualifiedExpressionNodes = useNodeLabelQualifier(nodes, nodesLoaded, expressions?.entities);
  const qualifiedFieldNodes = useNodeFieldQualifier(nodes, nodesLoaded, fields?.entities);
  return (
    <Modal
      className="ocs-modal co-catalog-page__overlay"
      isOpen={isOpen}
      onClose={onCancel}
      position="top"
      variant={ModalVariant.medium}
    >
      <ModalHeader title={title} />
      <ModalBody>
        <AffinityForm
          expressions={expressions}
          fields={fields}
          focusedAffinity={focusedAffinity}
          isSubmitDisabled={isDisabled}
          nodesLoaded={nodesLoaded}
          qualifiedNodes={getIntersectedQualifiedNodes({
            expressionNodes: qualifiedExpressionNodes,
            expressions: expressions?.entities,
            fieldNodes: qualifiedFieldNodes,
            fields: fields?.entities,
          })}
          setFocusedAffinity={setFocusedAffinity}
          setSubmitDisabled={setIsDisabled}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={isDisabled}
          onClick={() =>
            onSubmit({
              ...focusedAffinity,
              expressions: expressions?.entities,
              fields: fields?.entities,
            })
          }
        >
          {t('Save affinity rule')}
        </Button>
        <Button onClick={onCancel} variant={ButtonVariant.link}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AffinityEditModal;
