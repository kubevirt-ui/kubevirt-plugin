import React, { FC, useState } from 'react';

import { HyperConvergedModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import SectionWithSwitch from '@kubevirt-utils/components/SectionWithSwitch/SectionWithSwitch';
import { FEATURE_HCO_PERSISTENT_RESERVATION } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import LightspeedSimplePopoverContent from '@lightspeed/components/LightspeedSimplePopoverContent';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { CLUSTER_TAB_IDS } from '@overview/SettingsTab/search/constants';
import { Alert, AlertVariant } from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

type PersistentReservationSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
};

const PersistentReservationSection: FC<PersistentReservationSectionProps> = ({
  hyperConvergeConfiguration,
}) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const persistentReservation = Boolean(hyperConverge?.spec?.featureGates?.persistentReservation);

  const [error, setError] = useState<string>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toggleFeature } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION);

  const onChange = async (checked: boolean) => {
    if (!hyperConverge) return;
    setIsLoading(true);
    try {
      await k8sPatch<HyperConverged>({
        data: [
          {
            op: 'replace',
            path: `/spec/featureGates/persistentReservation`,
            value: checked,
          },
        ],
        model: HyperConvergedModel,
        resource: hyperConverge,
      });

      await toggleFeature(checked);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExpandSection
      searchItemId={CLUSTER_TAB_IDS.persistentReservation}
      toggleText={t('SCSI persistent reservation')}
    >
      <SectionWithSwitch
        helpTextIconContent={(hide) => (
          <LightspeedSimplePopoverContent
            content={t(
              'The SCSI reservation for disk makes the disk attached to the VirtualMachine as a SCSI LUN. This option should only be used for cluster-aware applications',
            )}
            hide={hide}
            obj={hyperConvergeConfiguration?.[0]}
            promptType={OLSPromptType.ENABLE_PERSISTENT_RESERVATION}
          />
        )}
        dataTestID="persistent-reservation"
        isDisabled={!hyperLoaded || !hyperConverge}
        isLoading={isLoading}
        switchIsOn={persistentReservation}
        title={t('Enable persistent reservation')}
        turnOnSwitch={onChange}
      />
      {error && (
        <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
          {error}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default PersistentReservationSection;
