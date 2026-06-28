import React, { FC, useMemo, useRef, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotations } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Grid, GridItem, Title } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { KeyValueEntries, KeyValueModalProps, Labels } from './utils/types';
import { entriesToLabels } from './utils/utils';
import { KeyValueModalRow } from './KeyValueModalRow';

import './key-value-modal.scss';

const toIdMap = (data: Labels): KeyValueEntries =>
  Object.fromEntries(Object.entries(data).map(([key, value], i) => [i, { key, value }]));

export const KeyValueModal: FC<KeyValueModalProps> = ({
  classifyEntries,
  headerText,
  initialData,
  isOpen,
  KeyRenderer,
  obj,
  onClose,
  onSubmit,
  submitBtnText,
  validateEntry,
}) => {
  const { t } = useKubevirtTranslation();

  const { systemEntries, userEntries: initialUserEntries } = useMemo(() => {
    const data = initialData ?? getAnnotations(obj, {});
    const classified = classifyEntries ? classifyEntries(data) : { system: {}, user: data };
    return { systemEntries: classified.system, userEntries: classified.user };
  }, [classifyEntries, initialData, obj]);

  const [entries, setEntries] = useState<KeyValueEntries>(() => {
    const mapped = toIdMap(initialUserEntries);
    return isEmpty(mapped) ? { 0: { key: '', value: '' } } : mapped;
  });

  const nextIdRef = useRef(Object.keys(entries).length);

  const existingKeys = useMemo(
    () => [...Object.values(entries).map(({ key }) => key), ...Object.keys(systemEntries)],
    [entries, systemEntries],
  );

  const hasEmptyKeys = useMemo(
    () => Object.values(entries).some(({ key }) => !key.trim()),
    [entries],
  );

  const hasEmptyValues = useMemo(
    () => Object.values(entries).some(({ key, value }) => key.trim() && !value.trim()),
    [entries],
  );

  const handleSubmit = () => {
    const values = Object.values(entries);
    const keys = values.map(({ key }) => key.trim()).filter(Boolean);

    if (new Set(keys).size !== keys.length)
      return Promise.reject(new Error(t('Duplicate keys found')));

    if (validateEntry) {
      const invalid = values.find(({ key, value }) => key && validateEntry(key, value));
      if (invalid) return Promise.reject(new Error(validateEntry(invalid.key, invalid.value)));
    }

    const userResult = entriesToLabels(values);
    return onSubmit(classifyEntries ? { ...systemEntries, ...userResult } : userResult);
  };

  const handleAddEntry = () =>
    setEntries((prev) => ({ ...prev, [nextIdRef.current++]: { key: '', value: '' } }));

  const handleDeleteEntry = (id: string) =>
    setEntries((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id)));

  const handleChangeEntry = (id: string, updated: { key: string; value: string }) =>
    setEntries((prev) => ({ ...prev, [id]: updated }));

  return (
    <TabModal<K8sResourceCommon>
      headerText={headerText ?? t('Edit annotations')}
      isDisabled={hasEmptyKeys || hasEmptyValues}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitBtnText={submitBtnText ?? t('Save')}
    >
      <Grid hasGutter>
        {KeyRenderer && (
          <>
            <GridItem span={5}>
              <Title headingLevel="h6">{t('Key')}</Title>
            </GridItem>
            <GridItem span={5}>
              <Title headingLevel="h6">{t('Value')}</Title>
            </GridItem>
            <GridItem span={2} />
          </>
        )}
        {Object.entries(entries).map(([id, { key, value }]) => (
          <KeyValueModalRow
            entry={{ key, value }}
            existingKeys={existingKeys}
            key={id}
            KeyRenderer={KeyRenderer}
            onChange={(updated) => handleChangeEntry(id, updated)}
            onDelete={() => handleDeleteEntry(id)}
          />
        ))}
        <div className="co-toolbar__group co-toolbar__group--left">
          <Button
            className="pf-m-link--align-left"
            icon={<PlusCircleIcon />}
            onClick={handleAddEntry}
            variant={ButtonVariant.link}
          >
            {KeyRenderer ? t('Add label') : t('Add more')}
          </Button>
        </div>
      </Grid>
    </TabModal>
  );
};
