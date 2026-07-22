import React, { FC } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Grid, GridItem, Stack, StackItem } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import LabelRow from './components/LabelRow';
import useLabelsModalState from './hooks/useLabelsModalState';

type NewLabelsModalProps = {
  initialLabels?: Record<string, string>;
  isOpen: boolean;
  obj: K8sResourceCommon;
  onClose: () => void;
  onLabelsSubmit: (labels: Record<string, string>) => Promise<unknown>;
};

const NewLabelsModal: FC<NewLabelsModalProps> = ({
  initialLabels,
  isOpen,
  obj,
  onClose,
  onLabelsSubmit,
}) => {
  const { t } = useKubevirtTranslation();

  const {
    existingKeys,
    handleSubmit,
    hasEmptyKeys,
    hasValidationErrors,
    initialKeys,
    labels,
    onLabelAdd,
    onLabelChange,
    onLabelDelete,
  } = useLabelsModalState({ initialLabels, obj, onLabelsSubmit });

  return (
    <TabModal
      headerText={t('Edit labels')}
      isDisabled={hasEmptyKeys || hasValidationErrors}
      isOpen={isOpen}
      obj={obj}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <Stack hasGutter>
        <StackItem>
          <Grid hasGutter>
            <GridItem span={5}>
              <b>{t('Key')}</b>
            </GridItem>
            <GridItem span={5}>
              <b>{t('Value')}</b>
            </GridItem>
            <GridItem span={2} />
            {labels.map((entry) => (
              <LabelRow
                existingKeys={existingKeys}
                initialKeys={initialKeys}
                key={entry.id}
                label={entry}
                onChange={(updated) => onLabelChange(entry.id, updated)}
                onDelete={() => onLabelDelete(entry.id)}
              />
            ))}
          </Grid>
        </StackItem>
        <StackItem>
          <Button
            className="pf-m-link--align-left"
            icon={<PlusCircleIcon />}
            onClick={onLabelAdd}
            variant={ButtonVariant.link}
          >
            {t('Add label')}
          </Button>
        </StackItem>
      </Stack>
    </TabModal>
  );
};

export default NewLabelsModal;
