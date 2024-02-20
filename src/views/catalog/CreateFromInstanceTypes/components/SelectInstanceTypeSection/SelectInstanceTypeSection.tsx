import React, { FC, useEffect, useMemo, useState } from 'react';

import RedHatProvidedInstanceTypesSection from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/RedHatProvidedInstanceTypesSection';
import UserProvidedInstanceTypesList from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/UserProvidedInstanceTypeList';
import { getUserProvidedInstanceTypes } from '@catalog/CreateFromInstanceTypes/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/utils/utils';
import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseInstanceTypeAndPreferencesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Tab, Tabs } from '@patternfly/react-core';

import { TabKey } from './utils/constants';

type SelectInstanceTypeSectionProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const SelectInstanceTypeSection: FC<SelectInstanceTypeSectionProps> = ({
  instanceTypesAndPreferencesData,
}) => {
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TabKey.RedHat);
  const { allInstanceTypes, loaded } = instanceTypesAndPreferencesData;

  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);

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
    <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
      <Tab eventKey={TabKey.RedHat} title={menuItems.redHatProvided.label}>
        <RedHatProvidedInstanceTypesSection redHatMenuItems={menuItems?.redHatProvided} />
      </Tab>
      <Tab eventKey={TabKey.Users} title={menuItems.userProvided.label}>
        <UserProvidedInstanceTypesList
          userProvidedInstanceTypes={getUserProvidedInstanceTypes(allInstanceTypes)}
        />
      </Tab>
    </Tabs>
  );
};

export default SelectInstanceTypeSection;
