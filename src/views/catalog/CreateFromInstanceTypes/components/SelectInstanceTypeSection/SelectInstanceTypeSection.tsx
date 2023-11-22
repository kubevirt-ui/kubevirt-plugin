import React, { FC, useEffect, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { UseInstanceTypeAndPreferencesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { instanceTypeSeriesNameMapper } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/constants';
import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Flex, Tab, Tabs } from '@patternfly/react-core';

import RedHatSeriesMenuCard from './components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';
import UsersInstanceTypesList from './components/UsersInstanceTypeList/UsersInstanceTypeList';
import useInstanceTypeCardMenuSection from './hooks/useInstanceTypeCardMenuSection';
import { TabKey } from './utils/constants';

type SelectInstanceTypeSectionProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const SelectInstanceTypeSection: FC<SelectInstanceTypeSectionProps> = ({
  instanceTypesAndPreferencesData,
}) => {
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TabKey.RedHat);
  const { instanceTypes, loaded } = instanceTypesAndPreferencesData;

  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();
  const menuItems = useMemo(() => getInstanceTypeMenuItems(instanceTypes), [instanceTypes]);

  const menuProps = useInstanceTypeCardMenuSection();

  useEffect(() => {
    // This effect is meant to focus the tab an IT was defined as default by the selected volume
    const tabToSwitch = menuItems.userProvided.items.includes(selectedInstanceType)
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
      <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
        <Tab eventKey={TabKey.RedHat} title={menuItems.redHatProvided.label}>
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            {menuItems.redHatProvided.items.map((rhSeriesItem) => {
              const seriesName = rhSeriesItem?.seriesName;
              return (
                !instanceTypeSeriesNameMapper[seriesName]?.disabled && (
                  <RedHatSeriesMenuCard
                    key={seriesName}
                    rhSeriesItem={rhSeriesItem}
                    {...menuProps}
                  />
                )
              );
            })}
          </Flex>
        </Tab>
        <Tab eventKey={TabKey.Users} title={menuItems.userProvided.label}>
          <UsersInstanceTypesList
            instanceTypesAndPreferencesData={instanceTypesAndPreferencesData}
          />
        </Tab>
      </Tabs>
    </>
  );
};

export default SelectInstanceTypeSection;
