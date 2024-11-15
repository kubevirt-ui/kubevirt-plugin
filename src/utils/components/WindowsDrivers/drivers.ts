import { useEffect } from 'react';

import { getDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { driverImage, loadingDriver } from '@kubevirt-utils/store/drivers';

export const useDriversImage = (): [string, boolean] => {
  useEffect(() => {
    if (!loadingDriver.value) return;

    getDriversImage()
      .then((image) => {
        driverImage.value = image;
      })
      .finally(() => (loadingDriver.value = false));
  }, []);

  return [driverImage.value, loadingDriver.value];
};
