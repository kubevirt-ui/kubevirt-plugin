import React, { type FC, useCallback, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import { type AutoAppliedLabel } from '@kubevirt-utils/hooks/useAutoAppliedLabels/types';
import useAutoAppliedLabels from '@kubevirt-utils/hooks/useAutoAppliedLabels/useAutoAppliedLabels';
import useKubevirtToast from '@kubevirt-utils/hooks/useKubevirtToast';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Grid,
  GridItem,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import AddKeyRow from './components/AddKeyRow';
import AutoAppliedLabelRow from './components/AutoAppliedLabelRow';

const AutoAppliedLabelsTable: FC = () => {
  const { t } = useKubevirtTranslation();
  const { addDangerToast } = useKubevirtToast();
  const { error, isAdmin, labels, loaded, updateLabels } = useAutoAppliedLabels();
  const [isAdding, setIsAdding] = useState(false);

  const existingKeys = labels.map((label) => label.key);
  const isDisabled = !isAdmin;

  const persist = useCallback(
    async (next: AutoAppliedLabel[]): Promise<void> => {
      try {
        await updateLabels(next);
      } catch {
        addDangerToast({ title: t('Failed to update auto-applied labels') });
      }
    },
    [addDangerToast, t, updateLabels],
  );

  const onAdd = useCallback(
    (label: AutoAppliedLabel): void => {
      void persist([...labels, label]);
      setIsAdding(false);
    },
    [labels, persist],
  );

  const onUpdate = useCallback(
    (index: number, updated: AutoAppliedLabel): void => {
      void persist(labels.map((label, i) => (i === index ? updated : label)));
    },
    [labels, persist],
  );

  const onDelete = useCallback(
    (index: number): void => {
      void persist(labels.filter((_label, i) => i !== index));
    },
    [labels, persist],
  );

  if (!loaded) {
    return <Skeleton />;
  }

  return (
    <Stack hasGutter>
      {error && (
        <StackItem>
          <ErrorAlert error={error} />
        </StackItem>
      )}
      <StackItem>
        <Grid>
          <GridItem span={5}>
            <Content component={ContentVariants.h6}>{t('Key')}</Content>
          </GridItem>
          <GridItem span={5}>
            <Content component={ContentVariants.h6}>{t('Value')}</Content>
          </GridItem>
          <GridItem span={2}>
            <Content component={ContentVariants.h6}>{t('Required')}</Content>
          </GridItem>
        </Grid>
      </StackItem>

      {isEmpty(labels) && !isAdding && (
        <StackItem>
          <Content component={ContentVariants.p}>{t('No auto-applied labels configured')}</Content>
        </StackItem>
      )}

      {labels.map((label, index) => (
        <StackItem key={label.key}>
          <AutoAppliedLabelRow
            existingKeys={existingKeys}
            isDisabled={isDisabled}
            label={label}
            onDelete={() => onDelete(index)}
            onUpdate={(updated) => onUpdate(index, updated)}
          />
        </StackItem>
      ))}

      {isAdding && (
        <StackItem>
          <AddKeyRow
            existingKeys={existingKeys}
            isDisabled={isDisabled}
            onAdd={onAdd}
            onCancel={() => setIsAdding(false)}
          />
        </StackItem>
      )}

      {!isAdding && (
        <StackItem>
          <Button
            icon={<PlusCircleIcon />}
            isDisabled={isDisabled}
            isInline
            onClick={() => setIsAdding(true)}
            variant={ButtonVariant.link}
          >
            {t('Add new key')}
          </Button>
        </StackItem>
      )}
    </Stack>
  );
};

export default AutoAppliedLabelsTable;
