import React, { FC, useEffect, useState } from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import {
  Button,
  ButtonVariant,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Skeleton,
  Stack,
  StackItem,
} from '@patternfly/react-core';

import ExpandSection from '../../../../ExpandSection/ExpandSection';
import GeneralSettingsError from '../shared/GeneralSettingsError';

import AppliedMemory from './components/AppliedMemory';
import CurrentMemoryDensity from './components/CurrentMemoryDensity';
import MemoryDensitySlider from './components/MemoryDensitySlider';
import useAppliedOvercommitRatio from './hooks/useAppliedOvercommitRatio';
import { useMemoryDensityValue } from './hooks/useMemoryDensityValue';
import { MEMORY_OVERCOMMIT_STARTING_VALUE } from './utils/const';
import { getCurrentOvercommit } from './utils/utils';

type MemoryDensityProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: any];
  newBadge: boolean;
};

const MemoryDensity: FC<MemoryDensityProps> = ({ hyperConvergeConfiguration, newBadge }) => {
  const { t } = useKubevirtTranslation();
  const isAdmin = useIsAdmin();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [error, setError] = useState<any>(null);

  const currentOvercommit = getCurrentOvercommit(hyperConverge);

  useEffect(() => {
    setIsSwitchOn(currentOvercommit > MEMORY_OVERCOMMIT_STARTING_VALUE);
  }, [currentOvercommit]);

  const { appliedRatio, isLoading: isLoadingRatio } = useAppliedOvercommitRatio(isSwitchOn);
  const { hasChanged, inputValue, isLoading, onSave, onSliderChange } = useMemoryDensityValue({
    currentOvercommit,
    hyperConverge,
  });

  const handleToggleSwitch = (checked: boolean) => {
    if (checked) {
      setIsSwitchOn(true);
    } else if (currentOvercommit > MEMORY_OVERCOMMIT_STARTING_VALUE) {
      setShowConfirmModal(true);
    } else {
      setIsSwitchOn(false);
    }
  };

  const handleConfirmDisable = async () => {
    setError(null);

    try {
      await onSave(MEMORY_OVERCOMMIT_STARTING_VALUE);
      setShowConfirmModal(false);
      setIsSwitchOn(false);
    } catch (err) {
      setError(err);
    }
  };

  const handleSave = async () => {
    setError(null);

    try {
      await onSave();
    } catch (err) {
      setError(err);
    }
  };

  if (!isAdmin) return null;
  if (!hyperLoaded) return <Skeleton width={'300px'} />;

  return (
    <>
      <ExpandSection searchItemId={CLUSTER_TAB_IDS.memoryDensity} toggleText={t('Memory density')}>
        <Stack hasGutter>
          <StackItem>
            <SectionWithSwitch
              dataTestID="memory-density"
              helpTextIconContent={t('Configures the VM workloads to use swap for higher density')}
              id="memory-density-feature"
              isDisabled={isLoading}
              isLoading={isLoading}
              newBadge={newBadge}
              switchIsOn={isSwitchOn}
              title={t('Configure memory density')}
              turnOnSwitch={handleToggleSwitch}
            />
          </StackItem>

          <GeneralSettingsError error={error?.message} loading={null} />

          {isSwitchOn && (
            <CurrentMemoryDensity currentOvercommit={currentOvercommit} isLoading={isLoading}>
              <MemoryDensitySlider
                hasChanged={hasChanged}
                inputValue={inputValue}
                isLoading={isLoading}
                onSave={handleSave}
                onSliderChange={onSliderChange}
              />

              {typeof appliedRatio === 'number' && appliedRatio !== currentOvercommit && (
                <AppliedMemory
                  appliedRatio={appliedRatio}
                  currentOvercommit={currentOvercommit}
                  isLoadingRatio={isLoadingRatio}
                />
              )}
            </CurrentMemoryDensity>
          )}
        </Stack>
      </ExpandSection>

      <Modal
        onClose={() => {
          setShowConfirmModal(false);
          setError(null);
        }}
        data-test-id="memory-density-disable-modal"
        isOpen={showConfirmModal}
        variant="small"
      >
        <ModalHeader title={t('Disable memory density?')} titleIconVariant="warning" />
        <ModalBody>
          {error && (
            <div className="pf-v6-u-mb-md">
              <ErrorAlert error={error} />
            </div>
          )}
          {t(
            'Disabling memory density will reset the memory overcommit percentage to 100%. This change will affect all VMs as they are migrated or restarted.',
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            data-test-id="memory-density-disable-confirm-button"
            isDisabled={isLoading}
            isLoading={isLoading}
            key="confirm"
            onClick={handleConfirmDisable}
            variant="primary"
          >
            {t('Disable')}
          </Button>
          <Button
            onClick={() => {
              setShowConfirmModal(false);
              setError(null);
            }}
            data-test-id="memory-density-disable-cancel-button"
            isDisabled={isLoading}
            key="cancel"
            variant={ButtonVariant.link}
          >
            {t('Cancel')}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default MemoryDensity;
