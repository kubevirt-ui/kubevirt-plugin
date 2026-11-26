import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useOutdatedVirtioDrivers from '@kubevirt-utils/resources/vm/utils/virtio-drivers/useOutdatedVirtioDrivers';
import { hasOutdatedVirtioDrivers } from '@kubevirt-utils/resources/vm/utils/virtio-drivers/utils';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Flex } from '@patternfly/react-core';
import VirtIODownloadsSettingsLink from '@virtualmachines/list/components/VirtIODriversAlert/components/VirtIODownloadsSettingsLink';

type OutdatedVirtIODriversDescriptionItemProps = {
  vm: V1VirtualMachine;
};

const OutdatedVirtIODriversDescriptionItem: FC<OutdatedVirtIODriversDescriptionItemProps> = ({
  vm,
}) => {
  const { t } = useKubevirtTranslation();
  const { outdatedVmKeys } = useOutdatedVirtioDrivers({
    name: getName(vm),
    namespace: getNamespace(vm),
  });

  if (!hasOutdatedVirtioDrivers(vm, outdatedVmKeys)) {
    return null;
  }

  return (
    <DescriptionItem
      descriptionData={
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <YellowExclamationTriangleIcon />
          <span>{t('Outdated')}</span>
          <VirtIODownloadsSettingsLink />
        </Flex>
      }
      descriptionHeader={t('VirtIO drivers')}
    />
  );
};

export default OutdatedVirtIODriversDescriptionItem;
