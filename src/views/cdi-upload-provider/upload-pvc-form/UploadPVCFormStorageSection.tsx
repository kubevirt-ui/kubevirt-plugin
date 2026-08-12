import React, { type Dispatch, type FC, type SetStateAction } from 'react';

import { type IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { Split, SplitItem } from '@patternfly/react-core';

import UploadPVCFormMode from './UploadPVCFormMode';
import UploadPVCFormSize from './UploadPVCFormSize';
import UploadPVCFormStorageClass from './UploadPVCFormStorageClass';

type UploadPVCFormStorageSectionProps = {
  applySP: boolean;
  loadError: Error | undefined;
  requestSizeUnit: string;
  requestSizeValue: string;
  setAccessMode: Dispatch<SetStateAction<string>>;
  setApplySP: Dispatch<SetStateAction<boolean>>;
  setRequestSizeUnit: Dispatch<SetStateAction<string>>;
  setRequestSizeValue: Dispatch<SetStateAction<string>>;
  setStorageClassName: Dispatch<SetStateAction<string>>;
  setVolumeMode: Dispatch<SetStateAction<string>>;
  spAccessMode: string[] | undefined;
  spLoaded: boolean;
  spVolumeMode: string | undefined;
  storageClasses: IoK8sApiStorageV1StorageClass[];
  storageClassName: string;
  volumeMode: string | undefined;
};

const UploadPVCFormStorageSection: FC<UploadPVCFormStorageSectionProps> = ({
  applySP,
  loadError,
  requestSizeUnit,
  requestSizeValue,
  setAccessMode,
  setApplySP,
  setRequestSizeUnit,
  setRequestSizeValue,
  setStorageClassName,
  setVolumeMode,
  spAccessMode,
  spLoaded,
  spVolumeMode,
  storageClasses,
  storageClassName,
  volumeMode,
}) => (
  <>
    <Split hasGutter>
      <SplitItem>
        <UploadPVCFormStorageClass
          applySP={applySP}
          setApplySP={setApplySP}
          setStorageClassName={setStorageClassName}
          storageClasses={storageClasses}
          storageClassName={storageClassName}
        />
      </SplitItem>
      <SplitItem>
        <UploadPVCFormSize
          requestSizeUnit={requestSizeUnit}
          requestSizeValue={requestSizeValue}
          setRequestSizeUnit={setRequestSizeUnit}
          setRequestSizeValue={setRequestSizeValue}
        />
      </SplitItem>
    </Split>
    {!spLoaded && !loadError ? (
      <Loading />
    ) : (
      <UploadPVCFormMode
        accessMode={spAccessMode?.[0]}
        applySP={applySP}
        setAccessMode={setAccessMode}
        setVolumeMode={setVolumeMode}
        storageClasses={storageClasses}
        storageClassName={storageClassName}
        volumeMode={volumeMode ?? spVolumeMode}
      />
    )}
  </>
);

export default UploadPVCFormStorageSection;
