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
import { useAffinitiesQualifiedNodes } from './hooks/useAffinityQualifiedNodes';
import { defaultNewAffinity } from './utils/constants';
import {
  getAffinityFromRowsData,
  getAvailableAffinityID,
  getRowsDataFromAffinity,
  intersectionWith,
  unionWith,
} from './utils/helpers';
import { AffinityCondition, AffinityRowData, AffinityType } from './utils/types';

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
  const currentAffinity = getAffinity(vm);

  const [affinities, setAffinities] = React.useState<AffinityRowData[]>(
    getRowsDataFromAffinity(currentAffinity),
  );

  const [isEditing, setIsEditing] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  const [focusedAffinity, setFocusedAffinity] = React.useState<AffinityRowData>(defaultNewAffinity);

  const [requiredNodeAffinities, preferredNodeAffinities] = React.useMemo(
    () => [
      affinities?.filter(
        (aff) => aff?.type === AffinityType.node && aff?.condition === AffinityCondition.required,
      ),
      affinities?.filter(
        (aff) => aff?.type === AffinityType.node && aff?.condition === AffinityCondition.preferred,
      ),
    ],
    [affinities],
  );

  // OR Relation between Required Affinities
  const qualifiedRequiredNodes = useAffinitiesQualifiedNodes(
    nodes,
    nodesLoaded,
    requiredNodeAffinities,
    React.useCallback(
      (suitableNodes) => suitableNodes.reduce((acc, curr) => unionWith(acc, curr), []),
      [],
    ),
  );

  // AND Relation between Preferred Affinities
  const qualifiedPreferredNodes = useAffinitiesQualifiedNodes(
    nodes,
    nodesLoaded,
    preferredNodeAffinities,
    React.useCallback(
      (suitableNodes) =>
        suitableNodes.reduce((acc, curr) => intersectionWith(acc, curr), suitableNodes[0]),
      [],
    ),
  );

  const onAffinityAdd = (affinity: AffinityRowData) => {
    setAffinities([...affinities, affinity]);
    setIsEditing(false);
    setIsCreating(false);
  };

  const onAffinityChange = (updatedAffinity: AffinityRowData) => {
    setAffinities(
      affinities.map((affinity) => {
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
    setAffinities(affinities.filter(({ id }) => id !== affinity.id));

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
      title={isCreating ? t('Create Affinity Rule') : t('Edit Affinity Rule')}
    />
  ) : (
    <TabModal
      isOpen={isOpen}
      onClose={onClose}
      obj={updatedVirtualMachine}
      onSubmit={onSubmit}
      headerText={t('Affinity Rules')}
      submitBtnText={t('Save')}
      modalVariant={ModalVariant.medium}
    >
      {list}
    </TabModal>
  );
};

export default AffinityModal;
