import React, { FC } from 'react';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';
import { Form } from '@patternfly/react-core';

import { DeschedulerType } from '../utils/types';

import ActualUtilizationProfile from './ActualUtilizationProfile/ActualUtilizationProfile';
import DeviationThresholds from './DeviationThresholds/DeviationThresholds';
import EnableSoftTainter from './EnableSoftTainter/EnableSoftTainter';
import LowNodeUtilizationThresholds from './LowNodeUtilizationThresholds/LowNodeUtilizationThresholds';

type DeschedulerCustomizationsProps = {
  deschedulerData: DeschedulerType;
};

const DeschedulerCustomizations: FC<DeschedulerCustomizationsProps> = ({ deschedulerData }) => {
  return (
    <ExpandSection toggleText={t('Profile customizations')}>
      <Form>
        <LowNodeUtilizationThresholds
          threshold={deschedulerData?.spec.profileCustomizations.devLowNodeUtilizationThresholds}
        />
        <DeviationThresholds
          threshold={deschedulerData?.spec.profileCustomizations.devDeviationThresholds}
        />
        <ActualUtilizationProfile
          utilizationProfile={
            deschedulerData?.spec.profileCustomizations.devActualUtilizationProfile
          }
        />
        <EnableSoftTainter
          isEnabled={deschedulerData?.spec.profileCustomizations.devEnableSoftTainter}
        />
      </Form>
    </ExpandSection>
  );
};

export default DeschedulerCustomizations;
