import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { Trans } from 'react-i18next';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { EmptyState, Title } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import AddBootableVolumeLink from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/AddBootableVolumeLink/AddBootableVolumeLink';
import BootableVolumeOSIcons from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/BootableVolumeEmptyState/BootableVolumeOSIcons';
import { getOsNameFromPreference } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/utils';

import './BootableVolumeEmptyState.scss';

type BootableVolumeEmptyStateProps = {
  isPreferenceFilter?: boolean;
};

const BootableVolumeEmptyState: FC<BootableVolumeEmptyStateProps> = ({ isPreferenceFilter }) => {
  const { t } = useKubevirtTranslation();
  const { loadError } = useInstanceTypesAndPreferences();
  const { control } = useVMWizard();
  const preference = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
  });

  const osName = getOsNameFromPreference(preference?.name);

  return (
    <EmptyState>
      <div className="bootable-volume-empty-state">
        <Title className="bootable-volume-empty-state__title" headingLevel="h3">
          {isPreferenceFilter
            ? t("You don't have any volumes for the chosen OS yet")
            : t("You don't have any volumes yet")}
        </Title>
        {isPreferenceFilter ? (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            To get started, <AddBootableVolumeLink loadError={loadError} /> or select &quot;No boot
            source&quot; to assign one later.
          </Trans>
        ) : (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            To get started, <AddBootableVolumeLink loadError={loadError} />.
          </Trans>
        )}
        <BootableVolumeOSIcons osName={osName} />
      </div>
    </EmptyState>
  );
};

export default BootableVolumeEmptyState;
