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
  isUploadForm: boolean;
  setBootableVolumeField: (key: string, fieldKey?: string) => (value: string) => void;
  upload: DataUpload;
};

const VolumeSource: FC<VolumeSourceProps> = ({
  bootableVolume,
  isUploadForm,
  setBootableVolumeField,
  upload,
}) => {
  const { t } = useKubevirtTranslation();
  const { pvcName, pvcNamespace, uploadFile, uploadFilename } = bootableVolume || {};

  return isUploadForm ? (
    <DiskSourceUploadPVC
      label={t('Upload PVC image')}
      relevantUpload={upload}
      setUploadFile={setBootableVolumeField('uploadFile')}
      setUploadFileName={setBootableVolumeField('uploadFilename')}
      uploadFile={uploadFile}
      uploadFileName={uploadFilename}
    />
  ) : (
    <>
      <DiskSourcePVCSelect
        setDiskSize={(newSize) =>
          setBootableVolumeField('size')(
            hasSizeUnit(newSize)
              ? removeByteSuffix(newSize)
              : removeByteSuffix(xbytes(Number(newSize), { iec: true, space: false })),
          )
        }
        pvcNameSelected={pvcName}
        pvcNamespaceSelected={pvcNamespace}
        selectPVCName={setBootableVolumeField('pvcName')}
        selectPVCNamespace={setBootableVolumeField('pvcNamespace')}
      />
      <Split hasGutter>
        <SplitItem>
          <Checkbox id="clone-pvc-checkbox" isChecked isDisabled label={t('Clone existing PVC')} />
        </SplitItem>
        <SplitItem>
          <HelpTextIcon
            bodyContent={t('This will create a cloned copy of the PVC in the destination project.')}
            position={PopoverPosition.right}
          />
        </SplitItem>
      </Split>
    </>
  );
};

export default VolumeSource;
