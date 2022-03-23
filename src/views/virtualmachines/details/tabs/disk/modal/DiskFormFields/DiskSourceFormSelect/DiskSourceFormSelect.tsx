import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { diskReducerActions, diskSourceReducerActions } from '../../state/actions';
import { DiskFormState, DiskSourceState } from '../../state/initialState';
import { sourceTypes } from '../utils/constants';
import { getSourceOptions } from '../utils/helpers';

import DiskSourceContainer from './components/DiskSourceContainer';
import DiskSourcePVCSelect from './components/DiskSourcePVCSelect';
import DiskSourceUrlInput from './components/DiskSourceUrlInput';

type DiskSourceFormSelectProps = {
  vm: V1VirtualMachine;
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<any>;
  isVMRunning: boolean;
  diskSourceState: DiskSourceState;
  dispatchDiskSourceState: React.Dispatch<any>;
};

const DiskSourceFormSelect: React.FC<DiskSourceFormSelectProps> = ({
  vm,
  diskState,
  dispatchDiskState,
  isVMRunning,
  diskSourceState,
  dispatchDiskSourceState,
}) => {
  const { t } = useKubevirtTranslation();
  const { diskSource, diskType } = diskState || {};
  const isCDROMType = diskType === diskTypes.cdrom;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const {
    urlSource,
    pvcSourceName,
    pvcCloneSourceName,
    pvcCloneSourceNamespace,
    registrySource,
    ephemeralSource,
  } = diskSourceState || {};

  const os = getAnnotation(vm?.spec?.template, ANNOTATIONS.os) || getOperatingSystem(vm);

  const sourceOptions = React.useMemo(() => Object.values(getSourceOptions(t)), [t]);

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();
    dispatchDiskState({ type: diskReducerActions.SET_DISK_SOURCE, payload: value });
    setIsOpen(false);
    // setDiskSource(value);
  };

  React.useEffect(() => {
    if (isCDROMType && [sourceTypes.BLANK, sourceTypes.EPHEMERAL].includes(diskSource)) {
      dispatchDiskState({ type: diskReducerActions.SET_DISK_SOURCE, payload: sourceTypes.HTTP });
    }
  }, [dispatchDiskState, isCDROMType, diskSource]);
  return (
    <>
      <FormGroup label={t('Source')} fieldId="disk-source" isRequired>
        <Select
          menuAppendTo="parent"
          isOpen={isOpen}
          onToggle={setIsOpen}
          onSelect={onSelect}
          variant={SelectVariant.single}
          selections={diskSource}
        >
          {sourceOptions.map(({ id, description, name }) => {
            const isDisabled =
              ((isVMRunning || isCDROMType) && id === sourceTypes.EPHEMERAL) ||
              (isCDROMType && id === sourceTypes.BLANK);
            return (
              <SelectOption isDisabled={isDisabled} key={id} value={id} description={description}>
                {name}
              </SelectOption>
            );
          })}
        </Select>
      </FormGroup>
      {diskSource === sourceTypes.HTTP && (
        <DiskSourceUrlInput
          url={urlSource}
          dispatch={dispatchDiskSourceState}
          os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]}
        />
      )}
      {diskSource === sourceTypes.REGISTRY && (
        <DiskSourceContainer
          url={registrySource}
          onChange={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_REGISTRY_SOURCE,
              payload: value,
            })
          }
          os={os}
        />
      )}
      {diskSource === sourceTypes.EPHEMERAL && (
        <DiskSourceContainer
          url={ephemeralSource}
          onChange={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_EPHEMERAL_SOURCE,
              payload: value,
            })
          }
          os={os}
        />
      )}
      {diskSource === sourceTypes.PVC && (
        <DiskSourcePVCSelect
          pvcNameSelected={pvcSourceName}
          // we allow to use only PVCs from the same namespace of the VM
          pvcNamespaceSelected={vm?.metadata?.namespace}
          selectPVCName={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_PVC_SOURCE_NAME,
              payload: value,
            })
          }
        />
      )}
      {diskSource === sourceTypes.CLONE_PVC && (
        <DiskSourcePVCSelect
          pvcNameSelected={pvcCloneSourceName}
          pvcNamespaceSelected={pvcCloneSourceNamespace}
          selectPVCName={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_PVC_CLONE_SOURCE_NAME,
              payload: value,
            })
          }
          selectPVCNamespace={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_PVC_CLONE_SOURCE_NAMESPACE,
              payload: value,
            })
          }
        />
      )}
    </>
  );
};

export default DiskSourceFormSelect;
