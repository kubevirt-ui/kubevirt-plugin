import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { ANNOTATIONS, OS_NAME_TYPES } from '@kubevirt-utils/resources/template';
import { diskTypes } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { hasSizeUnit as getOSNameWithoutVersionNumber } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { getOperatingSystem } from '@kubevirt-utils/resources/vm/utils/operation-system/operationSystem';
import { FormGroup, Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import {
  diskReducerActions,
  DiskReducerActionType,
  diskSourceReducerActions,
  DiskSourceReducerActionType,
} from '../../state/actions';
import { DEFAULT_DISK_SIZE, DiskFormState, DiskSourceState } from '../../state/initialState';
import { DYNAMIC, OTHER, sourceTypes } from '../utils/constants';
import { getSourceOptions } from '../utils/helpers';

import DiskSourceContainer from './components/DiskSourceContainer';
import DiskSourceDataSourceSelect from './components/DiskSourceDataSourceSelect';
import DiskSourcePVCSelect from './components/DiskSourcePVCSelect';
import DiskSourceUploadPVC from './components/DiskSourceUploadPVC';
import DiskSourceUrlInput from './components/DiskSourceUrlInput';

type DiskSourceFormSelectProps = {
  vm: V1VirtualMachine;
  diskState: DiskFormState;
  dispatchDiskState: React.Dispatch<DiskReducerActionType>;
  isVMRunning: boolean;
  diskSourceState: DiskSourceState;
  dispatchDiskSourceState: React.Dispatch<DiskSourceReducerActionType>;
  relevantUpload?: DataUpload;
};

const DiskSourceFormSelect: React.FC<DiskSourceFormSelectProps> = ({
  vm,
  diskState,
  dispatchDiskState,
  isVMRunning,
  diskSourceState,
  dispatchDiskSourceState,
  relevantUpload,
}) => {
  const { t } = useKubevirtTranslation();
  const { diskSource, diskType, diskSize } = diskState || {};
  const isCDROMType = diskType === diskTypes.cdrom;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const {
    urlSource,
    pvcSourceName,
    pvcCloneSourceName,
    pvcCloneSourceNamespace,
    registrySource,
    ephemeralSource,
    dataSourceName,
    dataSourceNamespace,
    uploadFile,
    uploadFilename,
  } = diskSourceState || {};

  const os = getAnnotation(vm?.spec?.template, ANNOTATIONS.os) || getOperatingSystem(vm);

  const sourceOptions = React.useMemo(() => Object.values(getSourceOptions(t)), [t]);

  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();

    if (diskSize === DYNAMIC && value !== sourceTypes.EPHEMERAL)
      dispatchDiskState({ type: diskReducerActions.SET_DISK_SIZE, payload: DEFAULT_DISK_SIZE });

    dispatchDiskState({ type: diskReducerActions.SET_DISK_SOURCE, payload: value });
    setIsOpen(false);
  };

  React.useEffect(() => {
    // if the selected disk source is black or ephemeral and the user changed
    // the disk type to CDROM, we need to reset the disk source to the default (url)
    if (isCDROMType && sourceTypes.BLANK === diskSource) {
      dispatchDiskState({ type: diskReducerActions.SET_DISK_SOURCE, payload: sourceTypes.HTTP });
    }
  }, [dispatchDiskState, isCDROMType, diskSource]);
  return (
    <>
      <FormGroup label={t('Source')} fieldId="disk-source" isRequired>
        <div data-test-id="disk-source-select">
          <Select
            data-test-id="disk-source-select"
            menuAppendTo="parent"
            isOpen={isOpen}
            onToggle={setIsOpen}
            onSelect={onSelect}
            variant={SelectVariant.single}
            selections={diskSource}
            isDisabled={diskSource === OTHER}
          >
            {sourceOptions.map(({ id, description, name }) => {
              const isDisabled =
                (isVMRunning && id === sourceTypes.EPHEMERAL) ||
                (isCDROMType && id === sourceTypes.BLANK);
              return (
                <SelectOption
                  isDisabled={isDisabled}
                  key={id}
                  value={id}
                  description={description}
                  data-test-id={`disk-source-select-${id}`}
                >
                  {name}
                </SelectOption>
              );
            })}
          </Select>
        </div>
      </FormGroup>
      {diskSource === sourceTypes.HTTP && (
        <DiskSourceUrlInput
          url={urlSource}
          onChange={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_URL_SOURCE,
              payload: value,
            })
          }
          data-test-id="disk-source-url-input"
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
          setDiskSize={(value) =>
            dispatchDiskState({ type: diskReducerActions.SET_DISK_SIZE, payload: value })
          }
        />
      )}
      {diskSource === sourceTypes.DATA_SOURCE && (
        <DiskSourceDataSourceSelect
          dataSourceNameSelected={dataSourceName}
          dataSourceNamespaceSelected={dataSourceNamespace}
          selectDataSourceName={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_DATA_SOURCE_NAME,
              payload: value,
            })
          }
          selectDataSourceNamespace={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_DATA_SOURCE_NAMESPACE,
              payload: value,
            })
          }
        />
      )}
      {diskSource === sourceTypes.UPLOAD && (
        <DiskSourceUploadPVC
          relevantUpload={relevantUpload}
          uploadFile={uploadFile}
          uploadFileName={uploadFilename}
          setUploadFile={(file) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_UPLOAD_PVC_FILE,
              file,
            })
          }
          setUploadFileName={(value) =>
            dispatchDiskSourceState({
              type: diskSourceReducerActions.SET_UPLOAD_PVC_FILENAME,
              payload: value,
            })
          }
        />
      )}
    </>
  );
};

export default DiskSourceFormSelect;
