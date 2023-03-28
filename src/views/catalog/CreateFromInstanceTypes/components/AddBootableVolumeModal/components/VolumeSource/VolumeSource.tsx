import React, { FC } from 'react';
import xbytes from 'xbytes';

import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import DiskSourcePVCSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourcePVCSelect';
import DiskSourceUploadPVC from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourceUploadPVC';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { hasSizeUnit } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { Checkbox, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';

import { AddBootableVolumeState } from '../../utils/constants';

type VolumeSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
  upload: DataUpload;
  isUploadForm: boolean;
};

const VolumeSource: FC<VolumeSourceProps> = ({
  bootableVolume,
  setBootableVolumeField,
  upload,
  isUploadForm,
}) => {
  const { t } = useKubevirtTranslation();
  const { uploadFile, uploadFilename, pvcName, pvcNamespace } = bootableVolume || {};

  return isUploadForm ? (
    <DiskSourceUploadPVC
      relevantUpload={upload}
      uploadFile={uploadFile}
      uploadFileName={uploadFilename}
      setUploadFile={setBootableVolumeField('uploadFile')}
      setUploadFileName={setBootableVolumeField('uploadFilename')}
      label={t('Upload PVC image')}
    />
  ) : (
    <>
      <DiskSourcePVCSelect
        pvcNameSelected={pvcName}
        pvcNamespaceSelected={pvcNamespace}
        selectPVCName={setBootableVolumeField('pvcName')}
        selectPVCNamespace={setBootableVolumeField('pvcNamespace')}
        setDiskSize={(newSize) =>
          setBootableVolumeField('size')(
            hasSizeUnit(newSize)
              ? newSize
              : removeByteSuffix(xbytes(Number(newSize), { iec: true, space: false })),
          )
        }
      />
      <Split hasGutter>
        <SplitItem>
          <Checkbox id="clone-pvc-checkbox" isChecked isDisabled label={t('Clone existing PVC')} />
        </SplitItem>
        <SplitItem>
          <HelpTextIcon
            bodyContent={t('This creates a cloned copy of the PVC in the destination project.')}
            position={PopoverPosition.right}
          />
        </SplitItem>
      </Split>
    </>
  );
};

export default VolumeSource;
