import React, { FC, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import { getInstanceTypeMenuItems } from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeMetadata/components/InstanceTypeDrilldownSelect/utils/utils';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import useInstanceTypesAndPreferences from '@kubevirt-utils/hooks/useInstanceTypesAndPreferences';
import { Tab, Tabs } from '@patternfly/react-core';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard-new/state/instance-type-vm-store/useInstanceTypeVMStore';
import { useVMWizard } from '@virtualmachines/creation-wizard-new/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_VM_DATA } from '@virtualmachines/creation-wizard-new/state/vm-wizard-form/consts';
import RedHatProvidedInstanceTypesSection from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/RedHatProvidedInstanceTypesSection/RedHatProvidedInstanceTypesSection';
import UserProvidedInstanceTypesList from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/UserProvidedInstanceTypeList';
import { getUserProvidedInstanceTypes } from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/components/UserProvidedInstanceTypeList/utils/utils';

import { TabKey } from './utils/constants';

const SelectInstanceTypeSection: FC = ({}) => {
  const [activeTabKey, setActiveTabKey] = useState<TabKey>(TabKey.RedHat);

  const { control } = useVMWizard();
  const [cluster, project] = useWatch({
    control,
    name: [CREATE_VM_FORM_FIELDS_VM_DATA.CLUSTER, CREATE_VM_FORM_FIELDS_VM_DATA.PROJECT],
  });
  const { selectedInstanceType } = useInstanceTypeVMStore();
  const { allInstanceTypes, loaded } = useInstanceTypesAndPreferences(project, cluster);

  const menuItems = useMemo(() => getInstanceTypeMenuItems(allInstanceTypes), [allInstanceTypes]);

  useEffect(() => {
    const isUserProvidedSelection =
      Boolean(selectedInstanceType?.namespace) ||
      (!selectedInstanceType?.namespace &&
        menuItems.userProvided.items.includes(selectedInstanceType?.name));

    const tabToSwitch = isUserProvidedSelection ? TabKey.Users : TabKey.RedHat;
    setActiveTabKey(tabToSwitch);
  }, [menuItems.userProvided.items, selectedInstanceType]);

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
