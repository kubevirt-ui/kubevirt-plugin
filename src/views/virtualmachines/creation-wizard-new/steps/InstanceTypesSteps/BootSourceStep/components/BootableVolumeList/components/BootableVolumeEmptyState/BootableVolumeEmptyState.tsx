import React, { FC } from 'react';
import { useWatch } from 'react-hook-form';
import { Trans } from 'react-i18next';

import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { LINUX, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { EmptyState, Title } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import AddBootableVolumeLink from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/AddBootableVolumeLink/AddBootableVolumeLink';
import BootableVolumeOSIcons from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/components/BootableVolumeEmptyState/BootableVolumeOSIcons';

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

  const osName = preference
    ? (() => {
        const base = preference.name.split('.')[0].split('-')[0];
        return base === OS_NAME_TYPES.rhel || base === OS_NAME_TYPES.windows ? base : LINUX;
      })()
    : undefined;

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
