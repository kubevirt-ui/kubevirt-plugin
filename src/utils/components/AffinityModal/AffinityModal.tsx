import * as React from 'react';
import produce from 'immer';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAffinity } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ModalVariant } from '@patternfly/react-core';

import AffinityEditModal from './components/AffinityEditModal/AffinityEditModal';
import AffinityEmptyState from './components/AffinityEmptyState';
import AffinityList from './components/AffinityList/AffinityList';
import { useRequiredAndPrefferedQualifiedNodes } from './hooks/useRequiredAndPrefferedQualifiedNodes';
import { defaultNewAffinity } from './utils/constants';
import {
  getAffinityFromRowsData,
  getAvailableAffinityID,
  getRowsDataFromAffinity,
} from './utils/helpers';
import { AffinityRowData } from './utils/types';

type AffinityModalProps = {
  vm: V1VirtualMachine;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
};

const AffinityModal: React.FC<AffinityModalProps> = ({
  vm,
  nodes,
  nodesLoaded,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const [affinities, setAffinities] = React.useState<AffinityRowData[]>(
    getRowsDataFromAffinity(getAffinity(vm)),
  );
  const [focusedAffinity, setFocusedAffinity] = React.useState<AffinityRowData>(defaultNewAffinity);

  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

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

  const updatedVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      if (!vmDraft.spec.template.spec.affinity) {
        vmDraft.spec.template.spec.affinity = {};
      }

      const updatedAffinity = getAffinityFromRowsData(affinities);

      if (!isEqualObject(getAffinity(vmDraft), updatedAffinity)) {
        vmDraft.spec.template.spec.affinity = updatedAffinity;
      }
    });
    return updatedVM;
  }, [vm, affinities]);

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
      obj={updatedVirtualMachine}
      onSubmit={onSubmit}
      headerText={t('Affinity rules')}
      modalVariant={ModalVariant.medium}
    >
      {list}
    </TabModal>
  );
};

export default AffinityModal;
