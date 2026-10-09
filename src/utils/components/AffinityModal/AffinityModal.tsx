import { type ReactNode, useMemo, useState } from 'react';

import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type K8sIoApiCoreV1Affinity } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ModalVariant } from '@patternfly/react-core';

import AffinityEditModal from './components/AffinityEditModal/AffinityEditModal';
import AffinityEmptyState from './components/AffinityEmptyState';
import AffinityList from './components/AffinityList/AffinityList';
import { useRequiredAndPreferredQualifiedNodes } from './hooks/useRequiredAndPreferredQualifiedNodes';
import { getRowsDataFromAffinity } from './utils/affinityToRows';
import { defaultNewAffinity } from './utils/constants';
import { getAffinityFromRowsData, getAvailableAffinityID } from './utils/helpers';
import { type AffinityRowData } from './utils/types';

type AffinityModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  initialAffinity: K8sIoApiCoreV1Affinity;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedResource: T) => Promise<T | void>;
  produceUpdatedResource: (affinity: K8sIoApiCoreV1Affinity) => T;
};

const AffinityModal = <T extends K8sResourceCommon>({
  initialAffinity,
  isOpen,
  onClose,
  onSubmit,
  produceUpdatedResource,
}: AffinityModalProps<T>): ReactNode => {
  const { t } = useKubevirtTranslation();

  const [affinities, setAffinities] = useState<AffinityRowData[]>(() =>
    getRowsDataFromAffinity(initialAffinity),
  );
  const [focusedAffinity, setFocusedAffinity] = useState<AffinityRowData>(defaultNewAffinity);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const updatedAffinity = useMemo(() => getAffinityFromRowsData(affinities), [affinities]);

  const updatedResource = useMemo(
    () => produceUpdatedResource(updatedAffinity),
    [produceUpdatedResource, updatedAffinity],
  );

  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: getCluster(updatedResource),
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const [qualifiedRequiredNodes, qualifiedPreferredNodes] = useRequiredAndPreferredQualifiedNodes(
    nodes,
    nodesLoaded,
    affinities,
  );

  const noChangesMade =
    (isEmpty(initialAffinity) && isEmpty(updatedAffinity)) ||
    isEqualObject(initialAffinity, updatedAffinity);

  const onAffinityAdd = (affinity: AffinityRowData): void => {
    setAffinities((prevAffinities) => [...(prevAffinities || []), affinity]);
    setIsEditing(false);
    setIsCreating(false);
  };

  const onAffinityChange = (updatedAffinityRow: AffinityRowData): void => {
    setAffinities((prevAffinities) =>
      prevAffinities.map((affinity) => {
        if (affinity.id === updatedAffinityRow.id) return { ...affinity, ...updatedAffinityRow };
        return affinity;
      }),
    );
    setIsEditing(false);
  };

  const onAffinityClickAdd = (): void => {
    setIsEditing(true);
    setIsCreating(true);
    setFocusedAffinity({ ...defaultNewAffinity, id: getAvailableAffinityID(affinities) });
  };

  const onAffinityClickEdit = (affinity: AffinityRowData): void => {
    setFocusedAffinity(affinity);
    setIsEditing(true);
  };

  const onAffinityDelete = (affinity: AffinityRowData): void =>
    setAffinities((prevAffinities) => prevAffinities.filter(({ id }) => id !== affinity.id));

  const onCancel = (): void => {
    setIsEditing(false);
    setIsCreating(false);
  };

  const onSaveAffinity = isCreating ? onAffinityAdd : onAffinityChange;

  const list = isEmpty(affinities) ? (
    <AffinityEmptyState onAffinityClickAdd={onAffinityClickAdd} />
  ) : (
    <AffinityList
      affinities={affinities}
      nodesLoaded={nodesLoaded}
      onAffinityClickAdd={onAffinityClickAdd}
      onDelete={onAffinityDelete}
      onEdit={onAffinityClickEdit}
      preferredQualifiedNodes={qualifiedPreferredNodes}
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
    <TabModal<T>
      headerText={t('Affinity rules')}
      isDisabled={noChangesMade}
      isOpen={isOpen}
      modalVariant={ModalVariant.medium}
      obj={updatedResource}
      onClose={onClose}
      onSubmit={onSubmit}
      submitBtnText={t('Apply rules')}
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      {list}
    </TabModal>
  );
};

export default AffinityModal;
