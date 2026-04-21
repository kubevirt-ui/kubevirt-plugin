import React, { FCC, MouseEvent, useEffect, useMemo, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RunStrategy } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  Content,
  ContentVariants,
  FormGroup,
  SelectOption,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import FormPFSelect from '../FormPFSelect/FormPFSelect';

import RunStrategyWarningAlert from './RunStrategyWarningAlert';
import {
  getRunStrategyDescriptions,
  getRunStrategyLabels,
  getRunStrategyWarningMessage,
  isValidRunStrategy,
  MIXED_HINT_ID,
  RunStrategyModalProps,
  RunStrategySelection,
} from './utils';

import './RunStrategyModal.scss';

const RunStrategyModal: FCC<RunStrategyModalProps> = ({
  hasMixedStrategies,
  hasStoppedVMs,
  initialRunStrategy,
  isOpen,
  isVMRunning,
  onClose,
  onSubmit,
  vmCount = 1,
}) => {
  const { t } = useKubevirtTranslation();
  const [runStrategy, setRunStrategy] = useState<RunStrategySelection>(initialRunStrategy ?? '');
  const labels = getRunStrategyLabels(t);
  const descriptions = getRunStrategyDescriptions(t);

  useEffect(() => {
    if (isOpen) {
      setRunStrategy(initialRunStrategy ?? '');
    }
  }, [isOpen, initialRunStrategy]);

  const handleChange = (_event: MouseEvent<Element>, value: string) => {
    if (isValidRunStrategy(value)) {
      setRunStrategy(value);
    }
  };

  const isMultiple = vmCount > 1;
  const showMixedStrategiesHint = isMultiple && (hasMixedStrategies ?? !initialRunStrategy);

  const warningMessage = useMemo(
    () =>
      runStrategy
        ? getRunStrategyWarningMessage(
            t,
            runStrategy,
            initialRunStrategy,
            isVMRunning,
            isMultiple,
            hasStoppedVMs,
          )
        : null,
    [hasStoppedVMs, initialRunStrategy, isMultiple, isVMRunning, runStrategy, t],
  );

  return (
    <TabModal
      headerText={t('Edit run strategy')}
      isDisabled={!runStrategy}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(runStrategy as RunStrategy)}
      shouldWrapInForm
    >
      <Stack hasGutter>
        <StackItem>
          <FormGroup fieldId="run-strategy-select" label={t('Run strategy')}>
            <FormPFSelect
              toggleProps={{
                'aria-describedby': showMixedStrategiesHint ? MIXED_HINT_ID : undefined,
                id: 'run-strategy-select',
                isFullWidth: true,
              }}
              onSelect={handleChange}
              placeholder={t('Select a run strategy')}
              selected={runStrategy || undefined}
              selectedLabel={runStrategy ? labels[runStrategy] || runStrategy : undefined}
            >
              {Object.entries(labels).map(([key, label]) => (
                <SelectOption description={descriptions[key]} key={key} value={key}>
                  {label}
                </SelectOption>
              ))}
            </FormPFSelect>
            {showMixedStrategiesHint && (
              <Content
                className="run-strategy-modal__mixed-hint"
                component={ContentVariants.small}
                id={MIXED_HINT_ID}
              >
                {t(
                  'Selected VirtualMachines use different run strategies. Choose a value to apply to all.',
                )}
              </Content>
            )}
          </FormGroup>
        </StackItem>
        <RunStrategyWarningAlert warningMessage={warningMessage} />
      </Stack>
    </TabModal>
  );
};

export default RunStrategyModal;
