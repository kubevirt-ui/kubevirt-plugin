import { type FC, useMemo, useState } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy as getHCOEvictionStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getEvictionStrategy } from '@kubevirt-utils/resources/vm';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';
import { EVICTION_STRATEGIES } from './constants';
import { produceVMWithEvictionStrategy } from './utils';

export type EvictionStrategyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  showPendingChangesAlert?: boolean;
  vm: V1VirtualMachine;
};

const EvictionStrategyModal: FC<EvictionStrategyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  showPendingChangesAlert,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

  const evictionStrategy = getEvictionStrategy(vm);

  const initialIsChecked = useMemo(() => {
    if (evictionStrategy || hyperLoadingError || !hyperLoaded) {
      return evictionStrategy === EVICTION_STRATEGIES.LiveMigrate;
    }

    const hcoEvictionStrategy = getHCOEvictionStrategy(hyperConverge);
    if (hcoEvictionStrategy) {
      return hcoEvictionStrategy === EVICTION_STRATEGIES.LiveMigrate;
    }

    return true;
  }, [hyperConverge, hyperLoaded, hyperLoadingError, evictionStrategy]);

  const [userChecked, setUserChecked] = useState<boolean | undefined>(undefined);
  const isChecked = userChecked ?? initialIsChecked;

  const isInitialStable = Boolean(evictionStrategy) || hyperLoaded || Boolean(hyperLoadingError);
  const noChangesMade = isInitialStable && isChecked === initialIsChecked;

  const updatedVM = useMemo(() => produceVMWithEvictionStrategy(vm, isChecked), [vm, isChecked]);

  return (
    <TabModal<V1VirtualMachine>
      headerText={t('Eviction strategy')}
      isDisabled={noChangesMade}
      isOpen={isOpen}
      obj={updatedVM}
      onClose={onClose}
      onSubmit={onSubmit}
      shouldWrapInForm
      submitDisabledTooltip={getNoModalChangesTooltip(t)}
    >
      {showPendingChangesAlert && <ModalPendingChangesAlert />}
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
