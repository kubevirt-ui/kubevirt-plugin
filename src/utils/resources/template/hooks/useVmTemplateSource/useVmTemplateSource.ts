import { useEffect, useMemo, useRef, useState } from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1PersistentVolumeClaim,
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
      const pvc = (await getPVC(name, namespace)) as V1alpha1PersistentVolumeClaim;
      if (pvc) {
        setIsBootSourceAvailable(true);
        setTemplateBootSource({
          source: {
            pvc: {
              name,
              namespace,
            },
          },
          sourceValue: { pvc },
          storageClassName: pvc?.spec?.storageClassName,
          type: BOOT_SOURCE.PVC,
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
          source: {
            pvc: dataSource?.spec?.source?.pvc,
            sourceRef: {
              kind: dataSource?.kind,
              name,
              namespace,
            },
          },
          storageClassName: pvc?.spec?.storageClassName,
          type: BOOT_SOURCE.DATA_SOURCE,
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
            source: bootSource.source,
            sourceValue: {
              http: bootSource?.source?.http,
            },
            type: bootSource.type,
          });
          setIsBootSourceAvailable(true);
          setLoaded(true);
        }
        break;

      case BOOT_SOURCE.REGISTRY:
        {
          setTemplateBootSource({
            source: bootSource.source,
            sourceValue: {
              registry: bootSource?.source?.registry,
            },
            type: bootSource.type,
          });
          setIsBootSourceAvailable(true);
          setLoaded(true);
        }
        break;
      case BOOT_SOURCE.CONTAINER_DISK:
        {
          setTemplateBootSource({
            source: bootSource.source,
            sourceValue: {
              containerDisk: bootSource?.source?.containerDisk,
            },
            type: bootSource.type,
          });
          setIsBootSourceAvailable(true);
          setLoaded(true);
        }
        break;
      default:
        setIsBootSourceAvailable(false);
        setLoaded(true);
        break;
    }

    prevBootSourceRef.current = bootSource;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSource]);

  return {
    error,
    isBootSourceAvailable,
    loaded,
    templateBootSource,
  };
};

type useVmTemplateSourceValue = {
  error: any;
  isBootSourceAvailable: boolean;
  loaded: boolean;
  templateBootSource: TemplateBootSource;
};
