import { type ReactNode, useMemo, useState } from 'react';

import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getEvictionStrategy as getHCOEvictionStrategy } from '@kubevirt-utils/resources/hyperconverged/selectors';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, FormGroup } from '@patternfly/react-core';

import FormGroupHelperText from '../FormGroupHelperText/FormGroupHelperText';
import { EVICTION_STRATEGIES } from './constants';

export type EvictionStrategyModalProps<T extends K8sResourceCommon = K8sResourceCommon> = {
  evictionStrategy: string | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedResource: T) => Promise<T | void>;
  produceUpdatedResource: (isChecked: boolean) => T;
  showPendingChangesAlert?: boolean;
};

const EvictionStrategyModal = <T extends K8sResourceCommon>({
  evictionStrategy,
  isOpen,
  onClose,
  onSubmit,
  produceUpdatedResource,
  showPendingChangesAlert,
}: EvictionStrategyModalProps<T>): ReactNode => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded, hyperLoadingError] = useHyperConvergeConfiguration();

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

  const updatedResource = useMemo(
    () => produceUpdatedResource(isChecked),
    [produceUpdatedResource, isChecked],
  );

  return (
    <TabModal<T>
      headerText={t('Eviction strategy')}
      isDisabled={noChangesMade}
      isOpen={isOpen}
      obj={updatedResource}
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
