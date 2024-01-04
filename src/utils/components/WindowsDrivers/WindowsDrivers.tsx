import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { mountWinDriversToVM } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { Alert, AlertVariant, Checkbox, Flex, FlexItem } from '@patternfly/react-core';

import { removeWindowsDrivers, useDriversImage } from './utils';

type WindowsDriversProps = {
  isWindows?: boolean;
  updateVM: (vm: V1VirtualMachine) => Promise<V1VirtualMachine | void> | void;
  vm: V1VirtualMachine;
};

const WindowsDrivers: FC<WindowsDriversProps> = ({ isWindows, updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
  const [isChecked, setIsChecked] = useState<boolean>(null);
  const [error, setError] = useState<Error>(undefined);
  const [loading, setLoading] = useState(false);

  const [driversImage, driversImageLoading] = useDriversImage();

  const windowsDriver = useMemo(
    () =>
      vm?.spec?.template?.spec?.volumes?.find(
        (volume) => volume.containerDisk?.image === driversImage,
      ),
    [vm, driversImage],
  );

  useEffect(() => {
    const updateDisk = async () => {
      setIsChecked(isWindows || !!windowsDriver);
      isWindows && !windowsDriver && (await updateVM(await mountWinDriversToVM(vm)));
    };

    isChecked === null && !driversImageLoading && updateDisk();
  }, [isChecked, isWindows, updateVM, driversImageLoading, vm, windowsDriver]);

  const onChange = useCallback(
    async (checked: boolean) => {
      setLoading(true);
      setIsChecked(checked);
      try {
        await updateVM(
          checked ? await mountWinDriversToVM(vm) : removeWindowsDrivers(vm, windowsDriver?.name),
        );
        setError(undefined);
      } catch (apiError) {
        setError(apiError);
      } finally {
        setLoading(false);
      }
    },
    [updateVM, vm, windowsDriver?.name],
  );

  if (loading || driversImageLoading) return <Loading />;

  return (
    <Flex>
      <FlexItem>
        <Checkbox
          className="pf-u-mt-md pf-u-display-flex pf-u-align-items-center"
          data-test-id="cdrom-drivers"
          id="cdrom-drivers"
          isChecked={isChecked}
          isDisabled={loading || driversImageLoading}
          label={t('Mount Windows drivers disk')}
          onChange={onChange}
        />
      </FlexItem>

      {error && (
        <FlexItem>
          <Alert isInline title={t('Error')} variant={AlertVariant.danger}>
            {error.message}
          </Alert>
        </FlexItem>
      )}
    </Flex>
  );
};
export default WindowsDrivers;
