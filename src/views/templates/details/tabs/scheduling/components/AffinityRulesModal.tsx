import * as React from 'react';
import produce from 'immer';
import { getAffinity } from 'src/views/templates/utils/selectors';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import AffinityEditModal from '@kubevirt-utils/components/AffinityModal/components/AffinityEditModal/AffinityEditModal';
import AffinityEmptyState from '@kubevirt-utils/components/AffinityModal/components/AffinityEmptyState';
import AffinityList from '@kubevirt-utils/components/AffinityModal/components/AffinityList/AffinityList';
import { useRequiredAndPrefferedQualifiedNodes } from '@kubevirt-utils/components/AffinityModal/hooks/useRequiredAndPrefferedQualifiedNodes';
import { defaultNewAffinity } from '@kubevirt-utils/components/AffinityModal/utils/constants';
import {
  getAffinityFromRowsData,
  getAvailableAffinityID,
  getRowsDataFromAffinity,
} from '@kubevirt-utils/components/AffinityModal/utils/helpers';
import { AffinityRowData } from '@kubevirt-utils/components/AffinityModal/utils/types';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, NodeModel, V1Template } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { ModalVariant } from '@patternfly/react-core';

type AffinityModalProps = {
  template: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedTemplate: V1Template) => Promise<V1Template | void>;
};

const AffinityRulesModal: React.FC<AffinityModalProps> = ({
  template,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [affinities, setAffinities] = React.useState<AffinityRowData[]>(
    getRowsDataFromAffinity(getAffinity(template)),
  );
  const [focusedAffinity, setFocusedAffinity] = React.useState<AffinityRowData>(defaultNewAffinity);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const [qualifiedRequiredNodes, qualifiedPreferredNodes] = useRequiredAndPrefferedQualifiedNodes(
    nodes,
    nodesLoaded,
    affinities,
  );

  const onAffinityAdd = (affinity: AffinityRowData) => {
    setAffinities((prevAffinities) => [...(prevAffinities || []), affinity]);
    setIsEditing(false);
    setIsCreating(false);
  };

  const onAffinityChange = (updatedAffinity: AffinityRowData) => {
    setAffinities((prevAffinities) =>
      prevAffinities.map((affinity) => {
        if (affinity.id === updatedAffinity.id) return { ...affinity, ...updatedAffinity };
        return affinity;
      }),
    );
    setIsEditing(false);
  };

  const onAffinityClickAdd = () => {
    setIsEditing(true);
    setIsCreating(true);
    setFocusedAffinity({ ...defaultNewAffinity, id: getAvailableAffinityID(affinities) });
  };

  const onAffinityClickEdit = (affinity: AffinityRowData) => {
    setFocusedAffinity(affinity);
    setIsEditing(true);
  };

  const onAffinityDelete = (affinity: AffinityRowData) =>
    setAffinities((prevAffinities) => prevAffinities.filter(({ id }) => id !== affinity.id));

  const onCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  const onSaveAffinity = isCreating ? onAffinityAdd : onAffinityChange;

  const updatedTemplate = React.useMemo(() => {
    return produce<V1Template>(template, (templateDraft: V1Template) => {
      if (!getAffinity(templateDraft)) {
        templateDraft.objects[0].spec.template.spec.affinity = [];
      }

      const updatedAffinity = getAffinityFromRowsData(affinities);

      if (!isEqualObject(getAffinity(templateDraft), updatedAffinity)) {
        templateDraft.objects[0].spec.template.spec.affinity = updatedAffinity;
      }
    });
  }, [affinities, template]);

  const list = isEmpty(affinities) ? (
    <AffinityEmptyState onAffinityClickAdd={onAffinityClickAdd} />
  ) : (
    <AffinityList
      affinities={affinities}
      onAffinityClickAdd={onAffinityClickAdd}
      qualifiedNodes={qualifiedRequiredNodes}
      prefferedQualifiedNodes={qualifiedPreferredNodes}
      nodesLoaded={nodesLoaded}
      onEdit={onAffinityClickEdit}
      onDelete={onAffinityDelete}
    />
  );

  return isEditing ? (
    <AffinityEditModal
      nodes={nodes}
      nodesLoaded={nodesLoaded}
      isOpen={isOpen}
      onCancel={onCancel}
      onSubmit={onSaveAffinity}
      focusedAffinity={focusedAffinity}
      setFocusedAffinity={setFocusedAffinity}
      title={isCreating ? t('Add affinity rule') : t('Edit affinity rule')}
    />
  ) : (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      obj={updatedTemplate}
      onSubmit={onSubmit}
      headerText={t('Affinity rules')}
      modalVariant={ModalVariant.medium}
      submitBtnText={t('Apply rules')}
    >
      {list}
    </TabModal>
  );
};

export default AffinityRulesModal;
