import React from 'react';
import { Updater } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getDataVolumeTemplates } from '@kubevirt-utils/resources/vm';

import { setSessionStorageTabsData, setSessionStorageVM } from './utils/session';
import { TabsData } from './utils/tabs-data';
import { ensurePath } from './utils/vm-produce';

export const useWizardVMEffects = (
  vm: V1VirtualMachine,
  tabsData: TabsData,
  updateTabsData: Updater<TabsData>,
) => {
  const dataVolumeTemplates = React.useMemo(() => getDataVolumeTemplates(vm), [vm]);

  // session storage effects
  React.useEffect(() => {
    // whenever the vm changes, save the vm in session storage
    if (vm) {
      setSessionStorageVM(vm);
    }
  }, [vm]);

  React.useEffect(() => {
    // whenever the tabs data changes, save the data in session storage
    if (tabsData) {
      setSessionStorageTabsData(tabsData);
    }
  }, [tabsData]);

  // add upload data volumes for ownerReference patch after vm is created
  React.useEffect(() => {
    if (dataVolumeTemplates) {
      // get new upload data volumes
      const uploadDVTs = dataVolumeTemplates.filter((dvt) => {
        if (dvt?.spec?.source?.upload) {
          return (
            (tabsData?.disks?.dataVolumesToAddOwnerRef || []).length === 0 ||
            tabsData?.disks?.dataVolumesToAddOwnerRef.every(
              (dv) => dv.metadata.name !== dvt.metadata.name,
            )
          );
        }
        return false;
      });

      if (uploadDVTs.length > 0) {
        updateTabsData((draft) => {
          ensurePath(draft, 'disks.dataVolumesToAddOwnerRef');
          if (draft.disks) {
            draft.disks.dataVolumesToAddOwnerRef = [
              ...(tabsData?.disks?.dataVolumesToAddOwnerRef || []),
              ...uploadDVTs,
            ];
          }
        });
      }
    }
  }, [dataVolumeTemplates, tabsData?.disks?.dataVolumesToAddOwnerRef, updateTabsData]);
};
