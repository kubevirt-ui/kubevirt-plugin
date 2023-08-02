import React, { ChangeEvent, Dispatch, FC, useEffect, useMemo, useState } from 'react';

import {
  appendDockerPrefix,
  removeDockerPrefix,
} from '@catalog/customize/components/CustomizeSource/utils';
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
  diskSourceState: DiskSourceState;
  diskState: DiskFormState;
  dispatchDiskSourceState: Dispatch<DiskSourceReducerActionType>;
  dispatchDiskState: Dispatch<DiskReducerActionType>;
  isTemplate: boolean;
  isVMRunning: boolean;
  relevantUpload?: DataUpload;
  vm: V1VirtualMachine;
};

const DiskSourceFormSelect: FC<DiskSourceFormSelectProps> = ({
  diskSourceState,
  diskState,
  dispatchDiskSourceState,
  dispatchDiskState,
  isTemplate,
  isVMRunning,
  relevantUpload,
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { diskSize, diskSource, diskType } = diskState || {};
  const isCDROMType = diskType === diskTypes.cdrom;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    dataSourceName,
    dataSourceNamespace,
    ephemeralSource,
    pvcCloneSourceName,
    pvcCloneSourceNamespace,
    pvcSourceName,
    registrySource,
    uploadFile,
    uploadFilename,
    urlSource,
  } = diskSourceState || {};

  const os = getAnnotation(vm?.spec?.template, ANNOTATIONS.os) || getOperatingSystem(vm);

  const sourceOptions = useMemo(() => getSourceOptions(isTemplate), [isTemplate]);

  const onSelect = (event: ChangeEvent<HTMLSelectElement>, value: string) => {
    event.preventDefault();

    if (diskSize === DYNAMIC && value !== sourceTypes.EPHEMERAL)
      dispatchDiskState({ payload: DEFAULT_DISK_SIZE, type: diskReducerActions.SET_DISK_SIZE });

    dispatchDiskState({ payload: value, type: diskReducerActions.SET_DISK_SOURCE });
    setIsOpen(false);
  };

  useEffect(() => {
    // if the selected disk source is black or ephemeral and the user changed
    // the disk type to CDROM, we need to reset the disk source to the default (url)
    if (isCDROMType && sourceTypes.BLANK === diskSource) {
      dispatchDiskState({ payload: sourceTypes.HTTP, type: diskReducerActions.SET_DISK_SOURCE });
    }
  }, [dispatchDiskState, isCDROMType, diskSource]);
  return (
    <>
      <FormGroup fieldId="disk-source" isRequired label={t('Source')}>
        <div data-test-id="disk-source-select">
          <Select
            data-test-id="disk-source-select"
            isDisabled={diskSource === OTHER}
            isOpen={isOpen}
            menuAppendTo="parent"
            onSelect={onSelect}
            onToggle={setIsOpen}
            selections={diskSource}
            variant={SelectVariant.single}
          >
            {sourceOptions.map(({ description, id, name }) => {
              const isDisabled =
                (isVMRunning && id === sourceTypes.EPHEMERAL) ||
                (isCDROMType && id === sourceTypes.BLANK) ||
                (isTemplate && id === sourceTypes.UPLOAD);
              return (
                <SelectOption
                  data-test-id={`disk-source-select-${id}`}
                  description={description}
                  isDisabled={isDisabled}
                  key={id}
                  value={id}
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
          onChange={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_URL_SOURCE,
            })
          }
          data-test-id="disk-source-url-input"
          os={OS_NAME_TYPES[getOSNameWithoutVersionNumber(os)]}
          url={urlSource}
        />
      )}
      {diskSource === sourceTypes.REGISTRY && (
        <DiskSourceContainer
          onChange={(value) =>
            dispatchDiskSourceState({
              payload: appendDockerPrefix(value),
              type: diskSourceReducerActions.SET_REGISTRY_SOURCE,
            })
          }
          os={os}
          url={removeDockerPrefix(registrySource)}
        />
      )}
      {diskSource === sourceTypes.EPHEMERAL && (
        <DiskSourceContainer
          onChange={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_EPHEMERAL_SOURCE,
            })
          }
          os={os}
          url={ephemeralSource}
        />
      )}
      {diskSource === sourceTypes.PVC && (
        <DiskSourcePVCSelect
          selectPVCName={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_PVC_SOURCE_NAME,
            })
          }
          pvcNameSelected={pvcSourceName}
          // we allow to use only PVCs from the same namespace of the VM
          pvcNamespaceSelected={vm?.metadata?.namespace}
        />
      )}
      {diskSource === sourceTypes.CLONE_PVC && (
        <DiskSourcePVCSelect
          selectPVCName={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_PVC_CLONE_SOURCE_NAME,
            })
          }
          selectPVCNamespace={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_PVC_CLONE_SOURCE_NAMESPACE,
            })
          }
          setDiskSize={(value) =>
            dispatchDiskState({ payload: value, type: diskReducerActions.SET_DISK_SIZE })
          }
          pvcNameSelected={pvcCloneSourceName}
          pvcNamespaceSelected={pvcCloneSourceNamespace}
        />
      )}
      {diskSource === sourceTypes.DATA_SOURCE && (
        <DiskSourceDataSourceSelect
          selectDataSourceName={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_DATA_SOURCE_NAME,
            })
          }
          selectDataSourceNamespace={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_DATA_SOURCE_NAMESPACE,
            })
          }
          dataSourceNameSelected={dataSourceName}
          dataSourceNamespaceSelected={dataSourceNamespace}
        />
      )}
      {diskSource === sourceTypes.UPLOAD && (
        <DiskSourceUploadPVC
          setUploadFile={(file) =>
            dispatchDiskSourceState({
              file,
              type: diskSourceReducerActions.SET_UPLOAD_PVC_FILE,
            })
          }
          setUploadFileName={(value) =>
            dispatchDiskSourceState({
              payload: value,
              type: diskSourceReducerActions.SET_UPLOAD_PVC_FILENAME,
            })
          }
          relevantUpload={relevantUpload}
          uploadFile={uploadFile}
          uploadFileName={uploadFilename}
        />
      )}
    </>
  );
};

export default DiskSourceFormSelect;
