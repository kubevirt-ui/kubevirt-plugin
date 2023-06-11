import { useCallback, useEffect, useMemo, useState } from 'react';
import { Updater } from 'use-immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { ensurePath, getRandomChars } from '@kubevirt-utils/utils/utils';

import { EnvironmentKind, EnvironmentVariable } from '../constants';
import {
  areEnvironmentsChanged,
  getRandomSerial,
  getVMEnvironmentsVariables,
  updateVolumeForKind,
} from '../utils';

type UseEnvironmentsType = {
  edited: boolean;
  environments: EnvironmentVariable[];
  error: Error;
  onEnvironmentAdd: () => void;
  onEnvironmentChange: (
    value: string,
    serial: string,
    kind: EnvironmentKind,
    diskName: string,
  ) => void;
  onEnvironmentRemove: (diskName: string) => void;
  setError: (error: Error | undefined) => void;
};

const useEnvironments = (
  vm: V1VirtualMachine,
  originalVM: V1VirtualMachine,
  updateVM: Updater<V1VirtualMachine>,
  onEditChange?: (edited: boolean) => void,
): UseEnvironmentsType => {
  const { t } = useKubevirtTranslation();
  const [error, setError] = useState<Error>();
  const [edited, setEdited] = useState(false);
  const originalEnvironments = useMemo(() => getVMEnvironmentsVariables(originalVM), [originalVM]);
  const environments = useMemo(() => getVMEnvironmentsVariables(vm), [vm]);

  useEffect(() => {
    const envsEdited = areEnvironmentsChanged(environments, originalEnvironments);

    if (envsEdited !== edited) {
      setEdited(envsEdited);
      if (onEditChange) onEditChange(envsEdited);
    }
  }, [edited, environments, onEditChange, originalEnvironments]);

  const onEnvironmentAdd = useCallback(() => {
    updateVM((draftVM: V1VirtualMachine) => {
      if (
        !draftVM.spec.template?.spec?.domain?.devices?.disks ||
        !draftVM.spec.template?.spec?.volumes
      ) {
        ensurePath(draftVM, 'spec.template.spec.domain.devices');
        draftVM.spec.template.spec.domain.devices.disks = [];
        draftVM.spec.template.spec.volumes = [];
      }

      const diskName = `environment-disk-${getRandomChars()}`;
      getDisks(draftVM).push({
        disk: { bus: 'sata' },
        name: diskName,
        serial: getRandomSerial().toUpperCase(),
      });
      getVolumes(draftVM).push({
        name: diskName,
      });
    });
  }, [updateVM]);

  const onEnvironmentChange = (
    diskName: string,
    name: string,
    serial: string,
    kind: EnvironmentKind,
  ) => {
    if (environments.find((env) => env.name === name)) {
      return setError(new Error(t('Resource already selected')));
    }

    if (error) {
      setError(null);
    }

    updateVM((draftVM: V1VirtualMachine) => {
      const volumes = getVolumes(draftVM);
      const envVolumeIndex = volumes?.findIndex((volume) => volume.name === diskName);
      const envDisk = getDisks(draftVM)?.find((disk) => disk.name === diskName);

      if (!envDisk || envVolumeIndex < 0) setError(undefined);

      envDisk.serial = serial;

      const newEnvVolume = updateVolumeForKind(volumes[envVolumeIndex], name, kind);

      volumes.splice(envVolumeIndex, 1, newEnvVolume);
    });
  };

  const onEnvironmentRemove = useCallback(
    (diskName: string) => {
      updateVM((draftVM) => {
        draftVM.spec.template.spec.volumes = (getVolumes(draftVM) || []).filter(
          (volume) => volume.name !== diskName,
        );

        draftVM.spec.template.spec.domain.devices.disks = (getDisks(draftVM) || []).filter(
          (disk) => disk.name !== diskName,
        );
      });
    },
    [updateVM],
  );

  return {
    edited,
    environments,
    error,
    onEnvironmentAdd,
    onEnvironmentChange,
    onEnvironmentRemove,
    setError,
  };
};

export default useEnvironments;
