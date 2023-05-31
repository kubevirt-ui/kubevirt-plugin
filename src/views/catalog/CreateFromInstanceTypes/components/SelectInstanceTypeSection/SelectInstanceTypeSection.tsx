import React, { FC, useEffect, useMemo, useState } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Grid, GridItem, Tab, Tabs } from '@patternfly/react-core';

import RedHatSeriesMenuCard from './components/RedHatSeriesMenuCard/RedHatSeriesMenuCard';
import UsersInstanceTypesList from './components/UsersInstanceTypeList/UsersInstanceTypeList';
import useInstanceTypeCardMenuSection from './hooks/useInstanceTypeCardMenuSection';
import { TabKey } from './utils/constants';

const SelectInstanceTypeSection: FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TabKey.RedHat);

  const {
    instanceTypesAndPreferencesData: { instanceTypes, loaded },
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
          <Grid span={2} hasGutter>
            {menuItems.redHatProvided.items.map((rhSeriesItem) => (
              <GridItem key={rhSeriesItem?.seriesName}>
                <RedHatSeriesMenuCard rhSeriesItem={rhSeriesItem} {...menuProps} />
              </GridItem>
            ))}
          </Grid>
        </Tab>
        <Tab eventKey={TabKey.Users} title={menuItems.userProvided.label}>
          <UsersInstanceTypesList />
        </Tab>
      </Tabs>
    </>
  );
};

export default SelectInstanceTypeSection;
