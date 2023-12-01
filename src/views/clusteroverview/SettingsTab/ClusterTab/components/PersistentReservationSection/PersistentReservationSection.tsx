import React, { FC, useState } from 'react';

import HyperConvergedModel from '@kubevirt-ui/kubevirt-api/console/models/HyperConvergedModel';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { FEATURE_HCO_PERSISTENT_RESERVATION } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { HyperConverged } from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  PopoverPosition,
  Split,
  SplitItem,
  Switch,
} from '@patternfly/react-core';

import ExpandSection from '../../../ExpandSection/ExpandSection';

type PersistentReservationSectionProps = {
  hyperConvergeConfiguration: [hyperConvergeConfig: HyperConverged, loaded: boolean, error: Error];
};

const PersistentReservationSection: FC<PersistentReservationSectionProps> = ({
  hyperConvergeConfiguration,
}) => {
  const { t } = useKubevirtTranslation();
  const [hyperConverge, hyperLoaded] = hyperConvergeConfiguration;
  const persistentReservation = hyperConverge?.spec?.featureGates?.persistentReservation ?? false;

  const [error, setError] = useState<Error>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toggleFeature } = useFeatures(FEATURE_HCO_PERSISTENT_RESERVATION);

  const onChange = async (checked: boolean) => {
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
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <ExpandSection toggleText={t('SCSI Persistent Reservation')}>
      <Split>
        <SplitItem isFilled>
          {t('Enable persistent reservation')}{' '}
          <HelpTextIcon
            bodyContent={t(
              'The SCSI reservation for disk makes the disk attached to the VirtualMachine as a SCSI LUN. This option should only be used for cluster-aware applications',
            )}
            className="KernelSamepageMerging__HelpTextIcon"
            helpIconClassName="KernelSamepageMerging__HelpIcon"
            position={PopoverPosition.bottom}
          />
        </SplitItem>
        {hyperLoaded && (
          <SplitItem>
            <Switch
              id="persistent-reservation-section"
              isChecked={persistentReservation}
              isDisabled={isLoading}
              onChange={onChange}
            />
          </SplitItem>
        )}
      </Split>
      {error && (
        <Alert
          className="persistent-reservation-section--alert"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {error}
        </Alert>
      )}
    </ExpandSection>
  );
};

export default PersistentReservationSection;
