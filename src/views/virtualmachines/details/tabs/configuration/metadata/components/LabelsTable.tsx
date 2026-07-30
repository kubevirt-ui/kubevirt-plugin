import React, { type FC, type ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import AutoAppliedBadge from '@kubevirt-utils/components/badges/AutoAppliedBadge/AutoAppliedBadge';
import NewLabelsModal from '@kubevirt-utils/components/LabelsModal/NewLabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels, getNamespace } from '@kubevirt-utils/resources/shared';
import { isSystemKey } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMListURL } from '@multicluster/urls';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Split, SplitItem, Truncate } from '@patternfly/react-core';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import AutoAppliedCount from './AutoAppliedCount';
import LabelsAnnotationsTable from './LabelsAnnotationsTable';

type LabelsTableProps = {
  editable?: boolean;
  onLabelsSubmit: (labels: Record<string, string>) => Promise<K8sResourceCommon | void>;
  resource: K8sResourceCommon;
};

const LabelsTable: FC<LabelsTableProps> = ({ editable = true, onLabelsSubmit, resource }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const navigate = useNavigate();

  const { labels: autoAppliedLabels, loaded: autoAppliedLoaded } = useAutoAppliedLabels();
  const autoAppliedMap = useMemo(
    () => new Map(autoAppliedLabels.map((label) => [label.key, label])),
    [autoAppliedLabels],
  );

  const allLabels = useMemo(() => getLabels(resource, {}), [resource]);
  const entries = useMemo(() => Object.entries(allLabels), [allLabels]);

  const autoAppliedCount = useMemo(
    () => entries.filter(([key]) => autoAppliedMap.has(key)).length,
    [entries, autoAppliedMap],
  );

  const canDelete = useCallback(
    (key: string): boolean => autoAppliedLoaded && !isSystemKey(key) && !autoAppliedMap.has(key),
    [autoAppliedLoaded, autoAppliedMap],
  );

  const canEdit = useCallback(
    (key: string): boolean =>
      autoAppliedLoaded && autoAppliedMap.has(key) && !autoAppliedMap.get(key)?.value,
    [autoAppliedLoaded, autoAppliedMap],
  );

  const openLabelsModal = useCallback(
    (): void =>
      createModal(({ isOpen, onClose }) => (
        <NewLabelsModal
          isOpen={isOpen}
          obj={resource}
          onClose={onClose}
          onLabelsSubmit={onLabelsSubmit}
        />
      )),
    [createModal, onLabelsSubmit, resource],
  );

  const onDelete = useCallback(
    (key: string): void => {
      const updated = { ...allLabels };
      delete updated[key];
      void onLabelsSubmit(updated);
    },
    [allLabels, onLabelsSubmit],
  );

  const onLabelClick = useCallback(
    (key: string, value: string): void => {
      const namespace = getNamespace(resource);
      const labelParam = encodeURIComponent(`${key}=${value}`);
      void navigate(
        `${getVMListURL(undefined, namespace)}?${VM_LIST_TAB_PARAM}=${VM_LIST_TAB_VMS}&labels=${labelParam}`,
      );
    },
    [navigate, resource],
  );

  const renderValue = useCallback(
    (key: string, value: string) => (
      <Button isInline onClick={() => onLabelClick(key, value)} variant={ButtonVariant.link}>
        <Truncate content={value || t('(empty)')} />
      </Button>
    ),
    [onLabelClick, t],
  );

  const renderKey = useCallback(
    (key: string): ReactNode => {
      if (!autoAppliedMap.has(key)) return key;
      return (
        <Split hasGutter>
          <SplitItem>{key}</SplitItem>
          <SplitItem>
            <AutoAppliedBadge />
          </SplitItem>
        </Split>
      );
    },
    [autoAppliedMap],
  );

  return (
    <LabelsAnnotationsTable
      addButtonLabel={t('Add labels')}
      canDelete={canDelete}
      canEdit={canEdit}
      dataTest="labels-card"
      editable={editable}
      emptyMessage={t('No labels yet.')}
      entries={entries}
      helpText={t('Labels can be used to organize and categorize VMs.')}
      onAdd={openLabelsModal}
      onDelete={onDelete}
      onEdit={openLabelsModal}
      renderKey={renderKey}
      renderValue={renderValue}
      searchId="labels"
      summaryContent={!isEmpty(autoAppliedLabels) && <AutoAppliedCount count={autoAppliedCount} />}
      title={t('Labels')}
    />
  );
};

export default LabelsTable;
