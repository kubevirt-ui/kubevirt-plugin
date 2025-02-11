import React, { FC, useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import {
  instanceTypeActionType,
  UseInstanceTypeAndPreferencesValues,
} from '@catalog/CreateFromInstanceTypes/state/utils/types';
import FolderSelect from '@kubevirt-utils/components/FolderSelect/FolderSelect';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { validateVMName } from '@kubevirt-utils/components/VMNameValidationHelperText/utils/utils';
import VMNameValidationHelperText from '@kubevirt-utils/components/VMNameValidationHelperText/VMNameValidationHelperText';
import { TREE_VIEW, TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DescriptionList, TextInput } from '@patternfly/react-core';

import { getCPUAndMemoryFromDefaultInstanceType, getOSFromDefaultPreference } from '../utils/utils';

type DetailsLeftGridProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const DetailsLeftGrid: FC<DetailsLeftGridProps> = ({ instanceTypesAndPreferencesData }) => {
  const { t } = useKubevirtTranslation();
  const { featureEnabled: treeViewEnabled } = useFeatures(TREE_VIEW);
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);

  const { instanceTypeVMState, setInstanceTypeVMState, vmNamespaceTarget } =
    useInstanceTypeVMStore();
  const { folder, selectedBootableVolume, selectedInstanceType, vmName } = instanceTypeVMState;
  const { clusterInstanceTypes, preferences } = instanceTypesAndPreferencesData;

  const preferencesMap = useMemo(() => convertResourceArrayToMap(preferences), [preferences]);
  const instanceTypesMap = useMemo(
    () => convertResourceArrayToMap(clusterInstanceTypes),
    [clusterInstanceTypes],
  );

  const vmNameValidated = validateVMName(vmName);

  const operatingSystem = getOSFromDefaultPreference(selectedBootableVolume, preferencesMap);
  const cpuMemoryString = !isEmpty(instanceTypesMap?.[selectedInstanceType?.name])
    ? getCPUAndMemoryFromDefaultInstanceType(instanceTypesMap[selectedInstanceType?.name])
    : null;

  return (
    <DescriptionList className="pf-v5-c-description-list" isHorizontal>
      <VirtualMachineDescriptionItem
        descriptionData={
          <>
            <TextInput
              onChange={(_event, newVMName) =>
                setInstanceTypeVMState({
                  payload: newVMName,
                  type: instanceTypeActionType.setVMName,
                })
              }
              aria-label="instancetypes virtualmachine name"
              data-test-id="instancetypes-vm-name-input"
              isRequired
              name="vmname"
              type="text"
              validated={vmNameValidated}
              value={vmName}
            />
            <VMNameValidationHelperText vmName={vmName} />
          </>
        }
        descriptionHeader={t('Name')}
      />
      {treeViewEnabled && treeViewFoldersEnabled && (
        <VirtualMachineDescriptionItem
          descriptionData={
            <FolderSelect
              setSelectedFolder={(newFolder) => {
                setInstanceTypeVMState({
                  payload: newFolder,
                  type: instanceTypeActionType.setFolder,
                });
              }}
              isFullWidth
              namespace={vmNamespaceTarget}
              selectedFolder={folder}
            />
          }
          descriptionHeader={t('Folder')}
        />
      )}
      <VirtualMachineDescriptionItem
        descriptionData={operatingSystem}
        descriptionHeader={t('Operating system')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={selectedInstanceType?.name}
        descriptionHeader={t('InstanceType')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={cpuMemoryString}
        descriptionHeader={t('CPU | Memory')}
      />
    </DescriptionList>
  );
};

export default DetailsLeftGrid;
