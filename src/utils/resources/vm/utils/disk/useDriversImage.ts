import { useEffect, useState } from 'react';

import { getDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { driverImage, loadingDriver } from '@kubevirt-utils/store/drivers';
import useClusterParam from '@multicluster/hooks/useClusterParam';

export const useDriversImage = (): [string, boolean] => {
  const cluster = useClusterParam();
  const [loadingDriverValue, setLoadingDriverValue] = useState(loadingDriver.value);
  const [driverImageValue, setDriverImageValue] = useState(driverImage.value);

  useEffect(() => {
    if (!loadingDriver.value) return;

    getDriversImage(cluster)
      .then((image) => {
        driverImage.value = image;
        setDriverImageValue(image);
      })
      .finally(() => {
        loadingDriver.value = false;
        setLoadingDriverValue(false);
      });
  }, [cluster]);

  return [driverImageValue, loadingDriverValue];
};
