import React, { FC, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { Tab, Tabs } from '@patternfly/react-core';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import {
  CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA,
  CREATE_VM_FORM_FIELDS_VM_DATA,
} from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import RedHatProvidedInstanceTypesSection from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/RedHatProvidedInstanceTypesSection';
import UserProvidedInstanceTypesList from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/UserProvidedInstanceTypeList';
import { getUserProvidedInstanceTypes } from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/utils/utils';

import { TabKey } from './utils/constants';
import { getActiveTabKey } from './utils/utils';

const SelectInstanceTypeSection: FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TabKey.RedHat);

  const { control } = useVMWizard();
  const [cluster, project, selectedInstanceType] = useWatch({
    control,
    name: [
      CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER,
      CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT,
      CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.SELECTED_INSTANCE_TYPE,
    ],
  });
  const { allInstanceTypes, loaded } = useInstanceTypesAndPreferences(project, cluster);

  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);

  useEffect(() => {
    const tabToSwitch = getActiveTabKey(selectedInstanceType, menuItems);
    setActiveTabKey(tabToSwitch);
  }, [menuItems, selectedInstanceType]);

  if (!loaded) return <Loading />;

  const handleTabClick = (_, tabIndex: TabKey) => {
    setActiveTabKey(tabIndex);
  };

  return (
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
  );
};

export default SelectInstanceTypeSection;
