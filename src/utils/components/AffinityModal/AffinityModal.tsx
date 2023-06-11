import * as React from 'react';
import produce from 'immer';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAffinity } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ModalVariant } from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { getChangedAffinity } from '../PendingChanges/utils/helpers';

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
  isOpen: boolean;
  nodes: IoK8sApiCoreV1Node[];
  nodesLoaded: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const AffinityModal: React.FC<AffinityModalProps> = ({
  isOpen,
  nodes,
  nodesLoaded,
  onClose,
  onSubmit,
  vm,
  vmi,
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
      nodesLoaded={nodesLoaded}
      onAffinityClickAdd={onAffinityClickAdd}
      onDelete={onAffinityDelete}
      onEdit={onAffinityClickEdit}
      prefferedQualifiedNodes={qualifiedPreferredNodes}
      qualifiedNodes={qualifiedRequiredNodes}
    />
  );

  return isEditing ? (
    <AffinityEditModal
      focusedAffinity={focusedAffinity}
      isOpen={isOpen}
      nodes={nodes}
      nodesLoaded={nodesLoaded}
      onCancel={onCancel}
      onSubmit={onSaveAffinity}
      setFocusedAffinity={setFocusedAffinity}
      title={isCreating ? t('Add affinity rule') : t('Edit affinity rule')}
    />
  ) : (
    <TabModal
      headerText={t('Affinity rules')}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Apply rules')}
    >
      {vmi && (
        <ModalPendingChangesAlert isChanged={getChangedAffinity(updatedVirtualMachine, vmi)} />
      )}
      {list}
    </TabModal>
  );
};

export default AffinityModal;
