import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSourceRef,
} from '@kubevirt-ui/kubevirt-api/kubevirt';

import {
  BOOT_SOURCE,
  getDataSourcePVC,
  getPVC,
  getTemplateBootSourceType,
  TemplateBootSource,
} from './utils';

export const useVmTemplateSource = (template: V1Template): useVmTemplateSourceValue => {
  const [templateBootSource, setTemplateBootSource] = React.useState<TemplateBootSource>(undefined);
  const [isBootSourceAvailable, setIsBootSourceAvailable] = React.useState<boolean>(false);
  const [loaded, setLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>();

  const bootSource = React.useMemo(() => getTemplateBootSourceType(template), [template]);

  const getPVCSource = ({ name, namespace }: V1beta1DataVolumeSourcePVC) => {
    setLoaded(false);
    return getPVC(name, namespace)
      .then((pvc: any) => {
        setIsBootSourceAvailable(true);
        setTemplateBootSource({
          type: BOOT_SOURCE.PVC,
          source: {
            pvc,
          },
          sourceValue: { pvc },
        });
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => setLoaded(true));
  };

  const getDataSourcePVCSource = ({ name, namespace }: V1beta1DataVolumeSourceRef) => {
    setLoaded(false);
    return getDataSourcePVC(name, namespace)
      .then((pvc: any) => {
        setIsBootSourceAvailable(true);
        setTemplateBootSource({
          type: BOOT_SOURCE.PVC_AUTO_UPLOAD,
          source: bootSource.source,
          sourceValue: { sourceRef: pvc },
        });
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => setLoaded(true));
  };

  React.useEffect(() => {
    setError(undefined);
    setTemplateBootSource(undefined);
    setIsBootSourceAvailable(false);

    switch (bootSource?.type) {
      case BOOT_SOURCE.PVC:
        getPVCSource(bootSource?.source?.pvc);
        break;

      case BOOT_SOURCE.PVC_AUTO_UPLOAD:
        getDataSourcePVCSource(bootSource?.source?.sourceRef);
        break;

      case BOOT_SOURCE.URL:
        {
          setTemplateBootSource({
            type: bootSource.type,
            source: bootSource.source,
            sourceValue: {
              http: bootSource?.source?.http,
            },
          });
          setIsBootSourceAvailable(true);
        }
        break;

      case BOOT_SOURCE.REGISTRY:
        {
          setTemplateBootSource({
            type: bootSource.type,
            source: bootSource.source,
            sourceValue: {
              registry: bootSource?.source?.registry,
            },
          });
          setIsBootSourceAvailable(true);
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSource]);

  return {
    templateBootSource,
    isBootSourceAvailable,
    loaded,
    error,
  };
};

type useVmTemplateSourceValue = {
  templateBootSource: TemplateBootSource;
  isBootSourceAvailable: boolean;
  loaded: boolean;
  error: any;
};
