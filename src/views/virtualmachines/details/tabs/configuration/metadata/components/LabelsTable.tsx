import React, { type FC, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { LabelsModal } from '@kubevirt-utils/components/LabelsModal/LabelsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabels, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMListURL } from '@multicluster/urls';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Truncate } from '@patternfly/react-core';
import { VM_LIST_TAB_PARAM, VM_LIST_TAB_VMS } from '@virtualmachines/navigator/constants';

import { isSystemLabel } from '../utils/utils';
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

  const allLabels = useMemo(() => getLabels(resource, {}), [resource]);
  const entries = useMemo(() => Object.entries(allLabels), [allLabels]);

  const canDelete = useCallback((key: string): boolean => !isSystemLabel(key), []);

  const onAdd = useCallback(
    (): void =>
      createModal(({ isOpen, onClose }) => (
        <LabelsModal
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

  return (
    <LabelsAnnotationsTable
      addButtonLabel={t('Add labels')}
      canDelete={canDelete}
      dataTest="labels-card"
      editable={editable}
      emptyMessage={t('No labels yet.')}
      entries={entries}
      helpText={t('Labels can be used to organize and categorize VMs.')}
      onAdd={onAdd}
      onDelete={onDelete}
      renderValue={renderValue}
      searchId="labels"
      title={t('Labels')}
    />
  );
};

export default LabelsTable;
