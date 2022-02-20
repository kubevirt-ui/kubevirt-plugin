import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
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
  const [loaded, setLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<any>();

  const bootSource = React.useMemo(() => getTemplateBootSourceType(template), [template]);

  const getPVCSource = (pvc: V1beta1DataVolumeSourcePVC) => {
    setLoaded(false);
    return getPVC(pvc?.name, pvc?.namespace)
      .then((foundPvc: any) => {
        setTemplateBootSource({
          type: BOOT_SOURCE.PVC,
          source: {
            pvc,
          },
          sourceValue: { pvc: foundPvc },
        });
      })
      .catch((e) => {
        setError(e);
      })
      .finally(() => setLoaded(true));
  };

  const getDataSourcePVCSource = (dataSource: V1beta1DataVolumeSourceRef) => {
    setLoaded(false);
    return getDataSourcePVC(dataSource.name, dataSource.namespace)
      .then((pvc: any) => {
        setTemplateBootSource({
          type: BOOT_SOURCE.PVC_AUTO_UPLOAD,
          source: {
            sourceRef: {
              kind: DataSourceModel.kind,
              name: bootSource?.source?.sourceRef?.name,
              namespace: bootSource?.source?.sourceRef?.namespace,
            },
          },
          sourceValue: { pvc },
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
          });
        }
        break;

      case BOOT_SOURCE.REGISTRY:
        {
          setTemplateBootSource({
            type: bootSource.type,
            source: bootSource.source,
          });
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSource]);

  return {
    templateBootSource,
    loaded,
    error,
  };
};

type useVmTemplateSourceValue = {
  templateBootSource: TemplateBootSource;
  loaded: boolean;
  error: any;
};
