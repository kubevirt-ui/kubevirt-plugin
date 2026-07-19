import React, { FC, useCallback, useMemo } from 'react';

import { AnnotationsModal } from '@kubevirt-utils/components/AnnotationsModal/AnnotationsModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { isSystemKey } from '@kubevirt-utils/utils/labelValidation/labelValidation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Truncate } from '@patternfly/react-core';

import LabelsAnnotationsTable from './LabelsAnnotationsTable';

type AnnotationsTableProps = {
  editable?: boolean;
  onAnnotationsSubmit: (annotations: Record<string, string>) => Promise<K8sResourceCommon | void>;
  resource: K8sResourceCommon;
};

const AnnotationsTable: FC<AnnotationsTableProps> = ({
  editable = true,
  onAnnotationsSubmit,
  resource,
}) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  const allAnnotations = useMemo(() => getAnnotations(resource, {}), [resource]);
  const entries = useMemo(() => Object.entries(allAnnotations), [allAnnotations]);

  const canDelete = useCallback((key: string): boolean => !isSystemKey(key), []);

  const onAdd = useCallback(
    (): void =>
      createModal(({ isOpen, onClose }) => (
        <AnnotationsModal
          isOpen={isOpen}
          obj={resource}
          onClose={onClose}
          onSubmit={onAnnotationsSubmit}
        />
      )),
    [createModal, onAnnotationsSubmit, resource],
  );

  const onDelete = useCallback(
    (key: string): void => {
      const updated = { ...allAnnotations };
      delete updated[key];
      void onAnnotationsSubmit(updated);
    },
    [allAnnotations, onAnnotationsSubmit],
  );

  const renderValue = useCallback(
    (_key: string, value: string) => <Truncate content={value || ''} />,
    [],
  );

  return (
    <LabelsAnnotationsTable
      addButtonLabel={t('Add annotations')}
      canDelete={canDelete}
      dataTest="annotations-card"
      editable={editable}
      emptyMessage={t('No annotations yet.')}
      entries={entries}
      helpText={t(
        'Annotations store extra metadata. Unlike labels, they cannot select resources and suit larger values or configuration details.',
      )}
      onAdd={onAdd}
      onDelete={onDelete}
      renderValue={renderValue}
      searchId="annotations"
      title={t('Annotations')}
    />
  );
};

export default AnnotationsTable;
