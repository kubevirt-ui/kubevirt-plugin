import { useEffect, useMemo, useRef, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1DataVolumeSourcePVC,
  V1beta1DataVolumeSourceRef,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

import { BOOT_SOURCE } from '../../utils/constants';

import { getDataSource, getPVC, getTemplateBootSourceType, TemplateBootSource } from './utils';

/**
 * A Hook that returns the boot source status of a given template
 * @param {V1Template} template - template to check
 * @returns the boot source and its status
 */
export const useVmTemplateSource = (template: V1Template): useVmTemplateSourceValue => {
  const [templateBootSource, setTemplateBootSource] = useState<TemplateBootSource>(undefined);
  const [isBootSourceAvailable, setIsBootSourceAvailable] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<any>();
  const prevBootSourceRef = useRef<TemplateBootSource>();

  const bootSource = useMemo(() => getTemplateBootSourceType(template), [template]);

  const getPVCSource = async ({ name, namespace }: V1beta1DataVolumeSourcePVC) => {
    setLoaded(false);
    try {
      const pvc = await getPVC(name, namespace);
      if (pvc) {
        setIsBootSourceAvailable(true);
        setTemplateBootSource({
          type: BOOT_SOURCE.PVC,
          source: {
            pvc: {
              name,
              namespace,
            },
          },
          sourceValue: { pvc },
          storageClassName: pvc?.spec?.storageClassName,
        });
      }
    } catch (e) {
      setError(e);
    }
    setLoaded(true);
  };

  const getDataSourceCondition = async ({ name, namespace }: V1beta1DataVolumeSourceRef) => {
    setLoaded(false);
    try {
      const dataSource = await getDataSource(name, namespace);
      if (
        dataSource?.status?.conditions?.find((c) => c?.type === 'Ready' && c?.status === 'True')
      ) {
        setIsBootSourceAvailable(true);
        const pvc = await getPVC(
          dataSource?.spec?.source?.pvc?.name,
          dataSource?.spec?.source?.pvc?.namespace,
        );
        setTemplateBootSource({
          type: BOOT_SOURCE.DATA_SOURCE,
          source: {
            pvc: dataSource?.spec?.source?.pvc,
          },
          storageClassName: pvc?.spec?.storageClassName,
        });
      }
    } catch (e) {
      setError(e);
    }
    setLoaded(true);
  };

  useEffect(() => {
    if (isEqualObject(prevBootSourceRef?.current, bootSource)) return;

    setError(undefined);
    setTemplateBootSource(undefined);
    setIsBootSourceAvailable(false);

    switch (bootSource?.type) {
      case BOOT_SOURCE.PVC:
        getPVCSource(bootSource?.source?.pvc);
        break;

      case BOOT_SOURCE.DATA_SOURCE:
        getDataSourceCondition(bootSource?.source?.sourceRef);
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
          setLoaded(true);
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
          setLoaded(true);
        }
        break;
      case BOOT_SOURCE.CONTAINER_DISK:
        {
          setTemplateBootSource({
            type: bootSource.type,
            source: bootSource.source,
            sourceValue: {
              containerDisk: bootSource?.source?.containerDisk,
            },
          });
          setIsBootSourceAvailable(true);
          setLoaded(true);
        }
        break;
      default:
        break;
    }

    prevBootSourceRef.current = bootSource;
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
