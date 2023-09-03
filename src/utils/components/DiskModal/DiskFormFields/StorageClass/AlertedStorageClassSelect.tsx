import React, { Dispatch, FC, SetStateAction, useState } from 'react';

import DefaultStorageClassAlert from './DefaultStorageClassAlert';
import StorageClassSelect from './StorageClassSelect';

export type AlertedStorageClassSelectProps = {
  checkSC?: (selectedSC: string) => boolean;
  setStorageClassName: (value: string) => void;
  setStorageClassProvisioner?: Dispatch<SetStateAction<string>>;
  storageClass: string;
};

const AlertedStorageClassSelect: FC<AlertedStorageClassSelectProps> = (props) => {
  const [showSCAlert, setShowSCAlert] = useState(false);
  return (
    <>
      <StorageClassSelect {...props} setShowSCAlert={setShowSCAlert} />
      {showSCAlert && <DefaultStorageClassAlert />}
    </>
  );
};

export default AlertedStorageClassSelect;
