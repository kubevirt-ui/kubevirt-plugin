import React, { FC, useCallback, useMemo, useState } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { mountWinDriversToVM } from '@kubevirt-utils/resources/vm/utils/disk/drivers';
import { Alert, AlertVariant, Checkbox, Flex, FlexItem } from '@patternfly/react-core';

import { removeWindowsDrivers, useDriversImage } from './utils';

type WindowsDriversProps = {
  updateVM: (vm: V1VirtualMachine) => Promise<V1VirtualMachine | void> | void;
  vm: V1VirtualMachine;
};

const WindowsDrivers: FC<WindowsDriversProps> = ({ updateVM, vm }) => {
  const { t } = useKubevirtTranslation();
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

  const onChange = useCallback(
    async (checked: boolean) => {
      setLoading(true);

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

  return (
    <Flex>
      <FlexItem>
        <Checkbox
          className="pf-u-mt-md pf-u-display-flex pf-u-align-items-center"
          data-test-id="cdrom-drivers"
          id="cdrom-drivers"
          isChecked={!!windowsDriver}
          isDisabled={loading || driversImageLoading}
          label={t('Mount Windows drivers disk')}
          onChange={onChange}
        />
        {loading && <Loading />}
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
