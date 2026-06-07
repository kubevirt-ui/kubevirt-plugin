import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Grid, GridItem, Title } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { KeyValueEntries, KeyValueModalProps } from './utils/types';
import { Labels } from './utils/utils';
import { KeyValueModalRow } from './KeyValueModalRow';

import './key-value-modal.scss';

const toIdMap = (data: Labels): KeyValueEntries =>
  Object.fromEntries(Object.entries(data).map(([key, value], i) => [i, { key, value }]));

export const KeyValueModal: FC<KeyValueModalProps> = ({
  classifyEntries,
  headerText,
  initialData,
  isOpen,
  isSystemKey,
  keyRenderer,
  obj,
  onClose,
  onSubmit,
  submitBtnText,
  validateEntry,
}) => {
  const { t } = useKubevirtTranslation();
  const nextIdRef = useRef(1000);
  const getNextId = () => nextIdRef.current++;

  const [entries, setEntries] = useState<KeyValueEntries>({});
  const [systemEntries, setSystemEntries] = useState<Labels>({});

  useEffect(() => {
    const data = initialData ?? obj?.metadata?.annotations ?? {};
    const classified = classifyEntries ? classifyEntries(data) : { system: {}, user: data };
    const userEntries = toIdMap(classified.user);
    const hasUserEntries = Object.keys(userEntries).length > 0;
    setEntries(hasUserEntries ? userEntries : { [getNextId()]: { key: '', value: '' } });
    setSystemEntries(classified.system);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const existingKeys = useMemo(
    () => [...Object.values(entries).map(({ key }) => key), ...Object.keys(systemEntries)],
    [entries, systemEntries],
  );

  const hasEmptyKeys = useMemo(
    () => Object.values(entries).some(({ key }) => !key.trim()),
    [entries],
  );

  const onModalSubmit = () => {
    const values = Object.values(entries);
    const keys = values.map(({ key }) => key.trim()).filter(Boolean);

    if (new Set(keys).size !== keys.length)
      return Promise.reject(new Error(t('Duplicate keys found')));

    if (validateEntry) {
      for (const { key, value } of values) {
        if (!key) continue;
        const error = validateEntry(key, value);
        if (error) return Promise.reject(new Error(error));
      }
    }

    const userResult = Object.fromEntries(
      values.filter(({ key }) => key.trim()).map(({ key, value }) => [key.trim(), value]),
    );

    if (classifyEntries) {
      const blockedKey = Object.keys(userResult).find(
        (k) => k in systemEntries || (isSystemKey && isSystemKey(k)),
      );
      if (blockedKey)
        return Promise.reject(
          new Error(t('Cannot use system-managed key: {{key}}', { key: blockedKey })),
        );
    }

    return onSubmit(classifyEntries ? { ...systemEntries, ...userResult } : userResult);
  };

  return (
    <TabModal<K8sResourceCommon>
      headerText={headerText ?? t('Edit annotations')}
      isDisabled={hasEmptyKeys}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={onModalSubmit}
      submitBtnText={submitBtnText ?? t('Save')}
    >
      <Grid hasGutter>
        {keyRenderer && (
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
        {Object.entries(entries || {}).map(([id, { key, value }]) => (
          <KeyValueModalRow
            onDelete={() =>
              setEntries((prev) =>
                Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id)),
              )
            }
            entry={{ key, value }}
            existingKeys={existingKeys}
            key={id}
            keyRenderer={keyRenderer}
            onChange={(updated) => setEntries((prev) => ({ ...prev, [id]: updated }))}
          />
        ))}
        <div className="co-toolbar__group co-toolbar__group--left">
          <Button
            onClick={() =>
              setEntries((prev) => ({
                ...prev,
                [getNextId()]: { key: '', value: '' },
              }))
            }
            className="pf-m-link--align-left"
            icon={<PlusCircleIcon />}
            variant={ButtonVariant.link}
          >
            {keyRenderer ? t('Add label') : t('Add more')}
          </Button>
        </div>
      </Grid>
    </TabModal>
  );
};
