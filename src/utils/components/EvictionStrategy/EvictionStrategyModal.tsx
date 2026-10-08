import type { FC } from 'react';
import { useMemo, useState } from 'react';
import produce from 'immer';

import type {
  V1VirtualMachine,
  V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy as getHCOEvictionStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { Checkbox, FormGroup } from '@patternfly/react-core';

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
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();
  const vmEvictionStrategy = getEvictionStrategy(vm);

  const initialIsChecked = useMemo(() => {
    if (vmEvictionStrategy || hyperLoadingError || !hyperLoaded) {
      return vmEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate;
    }

    const hcoEvictionStrategy = getHCOEvictionStrategy(hyperConverge);
    if (hcoEvictionStrategy) {
      return hcoEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate;
    }

    return true;
  }, [hyperConverge, hyperLoaded, hyperLoadingError, vmEvictionStrategy]);

  const [userChecked, setUserChecked] = useState<boolean | undefined>(undefined);
  const isChecked = userChecked ?? initialIsChecked;

  const isInitialStable = Boolean(vmEvictionStrategy) || hyperLoaded || Boolean(hyperLoadingError);
  const noChangesMade = isInitialStable && isChecked === initialIsChecked;

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec']);
      vmDraft.spec.template.spec.evictionStrategy = isChecked
        ? EVICTION_STRATEGIES.LiveMigrate
        : EVICTION_STRATEGIES.None;
    });
    return updatedVM;
  }, [vm, isChecked]);

  return (
    <TabModal
      headerText={headerText}
      isDisabled={noChangesMade}
      isOpen={isOpen}
      obj={updatedVirtualMachine}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      {vmi && <ModalPendingChangesAlert />}
      <FormGroup fieldId="eviction-strategy" isInline>
        <Checkbox
          id="eviction-strategy"
          isChecked={isChecked}
          label={t('LiveMigrate')}
          onChange={(_event, val) => setUserChecked(val)}
        />
        <FormGroupHelperText>
          {t(
            'EvictionStrategy can be set to "LiveMigrate" if the VirtualMachineInstance should be migrated instead of shut-off in case of a node drain.',
          )}
        </FormGroupHelperText>
      </FormGroup>
    </TabModal>
  );
};

export default EvictionStrategyModal;
