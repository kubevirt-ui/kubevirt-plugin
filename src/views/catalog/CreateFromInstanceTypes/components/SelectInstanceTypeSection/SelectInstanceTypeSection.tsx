import React, { FC, useEffect, useMemo, useState } from 'react';

import RedHatProvidedInstanceTypesSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/RedHatProvidedInstanceTypesSection';
import UserProvidedInstanceTypesList from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/UserProvidedInstanceTypeList';
import { getUserProvidedInstanceTypes } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/utils/utils';
import useInstanceTypeCpuManagerCompatibility from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/hooks/useInstanceTypeCpuManagerCompatibility';
import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseInstanceTypeAndPreferencesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Tab, Tabs } from '@patternfly/react-core';

import { TabKey } from './utils/constants';

type SelectInstanceTypeSectionProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const SelectInstanceTypeSection: FC<SelectInstanceTypeSectionProps> = ({
  instanceTypesAndPreferencesData,
}) => {
  const { t } = useKubevirtTranslation();
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TabKey.RedHat);
  const { allInstanceTypes, loaded } = instanceTypesAndPreferencesData;

  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);

  const [isIncompatible] = useInstanceTypeCpuManagerCompatibility(allInstanceTypes);

  useEffect(() => {
    // This effect is meant to focus the tab an IT was defined as default by the selected volume
    const tabToSwitch = menuItems.userProvided.items.includes(selectedInstanceType?.name)
      ? TabKey.Users
      : TabKey.RedHat;
    setActiveTabKey(tabToSwitch);
  }, [menuItems.userProvided.items, selectedInstanceType]);

  if (!loaded) return <Loading />;

  const handleTabClick = (_, tabIndex: TabKey) => {
    setActiveTabKey(tabIndex);
  };

  return (
    <>
      <Tabs activeKey={activeTabKey} className="pf-v6-u-mt-md" onSelect={handleTabClick}>
        <Tab eventKey={TabKey.RedHat} title={menuItems.redHatProvided.label}>
          <RedHatProvidedInstanceTypesSection redHatMenuItems={menuItems?.redHatProvided} />
        </Tab>
        <Tab eventKey={TabKey.Users} title={menuItems.userProvided.label}>
          <UserProvidedInstanceTypesList
            userProvidedInstanceTypes={getUserProvidedInstanceTypes(allInstanceTypes)}
          />
        </Tab>
      </Tabs>
      {isIncompatible && (
        <Alert
          className="pf-v6-u-mt-md"
          isInline
          title={t('Selected instance type may not be schedulable')}
          variant={AlertVariant.warning}
        >
          {t(
            'The selected instance type requires dedicated CPU placement (CPU Manager). No cluster nodes with the cpumanager=true label were found. The VirtualMachine may fail to start unless CPU Manager is configured on your nodes.',
          )}
        </Alert>
      )}
    </>
  );
};

export default SelectInstanceTypeSection;
