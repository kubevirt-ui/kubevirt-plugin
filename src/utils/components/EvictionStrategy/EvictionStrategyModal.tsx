import React, { FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, Form, FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';

import { EVICTION_STRATEGIES } from './constants';

type EvictionStrategyModalProps = {
  headerText: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const EvictionStrategyModal: FC<EvictionStrategyModalProps> = ({
  headerText,
  isOpen,
  onClose,
  onSubmit,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();

  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

  useEffect(() => {
    const vmEvictionStrategy = getEvictionStrategy(vm);
    if (vmEvictionStrategy || hyperLoadingError || !hyperLoaded) {
      setIsChecked(vmEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate);
      return;
    }

    if (hyperConverge?.spec?.evictionStrategy) {
      setIsChecked(hyperConverge?.spec?.evictionStrategy === EVICTION_STRATEGIES.LiveMigrate);
      return;
    }
  }, [hyperConverge, hyperLoaded, hyperLoadingError, vm]);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      if (isChecked) {
        vmDraft.spec.template.spec.evictionStrategy = EVICTION_STRATEGIES.LiveMigrate;
      } else {
        vmDraft.spec.template.spec.evictionStrategy = EVICTION_STRATEGIES.None;
      }
    });
    return updatedVM;
  }, [vm, isChecked]);

  return (
    <TabModal
      headerText={headerText}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <Form>
        {vmi && <ModalPendingChangesAlert />}
        <FormGroup fieldId="eviction-strategy" isInline>
          <Checkbox
            id="eviction-strategy"
            isChecked={isChecked}
            label={t('LiveMigrate')}
            onChange={(_event, val) => setIsChecked(val)}
          />
          <FormGroupHelperText>
            {t(
              'EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be migrated instead of shut-off in case of a node drain.',
            )}
          </FormGroupHelperText>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default EvictionStrategyModal;
