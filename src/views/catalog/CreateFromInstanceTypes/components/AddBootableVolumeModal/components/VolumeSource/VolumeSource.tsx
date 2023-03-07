import React, { FC } from 'react';
import xbytes from 'xbytes';

import { removeByteSuffix } from '@kubevirt-utils/components/CapacityInput/utils';
import DiskSourcePVCSelect from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourcePVCSelect';
import DiskSourceUploadPVC from '@kubevirt-utils/components/DiskModal/DiskFormFields/DiskSourceFormSelect/components/DiskSourceUploadPVC';
import { DataUpload } from '@kubevirt-utils/hooks/useCDIUpload/useCDIUpload';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox, Popover, Split, SplitItem } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { AddBootableVolumeState } from '../../utils/constants';

import './VolumeSource.scss';

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
            removeByteSuffix(xbytes(Number(newSize), { iec: true, space: false })),
          )
        }
      />
      <Checkbox
        id="clone-pvc-checkbox"
        isChecked
        isDisabled
        label={
          <Split hasGutter>
            <SplitItem>{t('Clone existing PVC')}</SplitItem>
            <SplitItem onClick={(e) => e.preventDefault()}>
              <Popover
                position="right"
                bodyContent={t(
                  'This will create a cloned copy of the PVC in the destination project.',
                )}
              >
                <HelpIcon className="icon-size-small" />
              </Popover>
            </SplitItem>
          </Split>
        }
      />
    </>
  );
};

export default VolumeSource;
