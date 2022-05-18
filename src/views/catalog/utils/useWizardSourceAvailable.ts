import * as React from 'react';

import {
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSourceRef,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { BOOT_SOURCE } from '@kubevirt-utils/resources/template';
import {
  getDataSource,
  getPVC,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getVMBootSourceType } from '@kubevirt-utils/resources/vm/utils/source';

import { useWizardVMContext } from './WizardVMContext';

type UseWizardSourceAvailable = {
  isBootSourceAvailable: boolean;
  loaded: boolean;
  error: any;
};

export const useWizardSourceAvailable = (): UseWizardSourceAvailable => {
  const { vm } = useWizardVMContext();
  const [isBootSourceAvailable, setIsBootSourceAvailable] = React.useState<boolean>(true);
  const [loaded, setLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>();

  const bootSource = React.useMemo(() => {
    return getVMBootSourceType(vm);
  }, [vm]);

  const getPVCSource = ({ name, namespace }: V1beta1DataVolumeSourcePVC) => {
    setLoaded(false);
    return getPVC(name, namespace)
      .then(() => {
        setIsBootSourceAvailable(true);
      })
      .catch((e) => {
        setIsBootSourceAvailable(false);
        setError(e);
      })
      .finally(() => setLoaded(true));
  };

  const getDataSourceCondition = ({ name, namespace }: V1beta1DataVolumeSourceRef) => {
    setLoaded(false);
    return getDataSource(name, namespace)
      .then((dataSource) => {
        if (
          dataSource?.status?.conditions?.find((c) => c.type === 'Ready' && c.status === 'True')
        ) {
          setIsBootSourceAvailable(true);
        } else {
          setIsBootSourceAvailable(false);
        }
      })
      .catch((e) => {
        setIsBootSourceAvailable(false);
        setError(e);
      })
      .finally(() => setLoaded(true));
  };

  React.useEffect(() => {
    setError(undefined);

    switch (bootSource?.type) {
      case BOOT_SOURCE.PVC:
        getPVCSource(bootSource?.source?.pvc);
        break;

      case BOOT_SOURCE.DATA_SOURCE:
        getDataSourceCondition(bootSource?.source?.sourceRef);
        break;

      case BOOT_SOURCE.URL:
      case BOOT_SOURCE.REGISTRY:
        {
          setIsBootSourceAvailable(true);
        }
        break;

      case undefined: {
        setIsBootSourceAvailable(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSource]);

  return {
    isBootSourceAvailable,
    loaded,
    error,
  };
};
