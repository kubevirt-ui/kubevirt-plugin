import type { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  spinnerSize,
  Tooltip,
} from '@patternfly/react-core';

import usePanicDeviceDescriptionState from './hooks/usePanicDeviceDescriptionState';
import { PANIC_DEVICES_BREADCRUMB, PANIC_DEVICES_SEARCH_ID } from './utils/constants';
import type { PanicDeviceDescriptionItemProps } from './utils/types';

const PanicDeviceDescriptionItem: FC<PanicDeviceDescriptionItemProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const { isPending, showWindowsWarning, statusText, vmName } = usePanicDeviceDescriptionState({
    vm,
    vmi,
  });
  const recommendedForWindows = t('Recommended for Windows');

  return (
    <DescriptionItem
      bodyContent={t(
        'A panic device provides additional crash information when a guest crashes. For Windows VMs, a panic device (such as pvpanic or hyperv) is recommended to report BSODs.',
      )}
      breadcrumb={PANIC_DEVICES_BREADCRUMB}
      data-test={`${vmName}-${PANIC_DEVICES_SEARCH_ID}`}
      descriptionData={
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>{isPending ? <Loading size={spinnerSize.sm} /> : statusText}</FlexItem>
          {showWindowsWarning && (
            <FlexItem>
              <Tooltip content={recommendedForWindows}>
                <Button
                  aria-label={recommendedForWindows}
                  data-test={`${vmName}-${PANIC_DEVICES_SEARCH_ID}-warning`}
                  icon={<YellowExclamationTriangleIcon />}
                  variant={ButtonVariant.plain}
                />
              </Tooltip>
            </FlexItem>
          )}
        </Flex>
      }
      descriptionHeader={<SearchItem id={PANIC_DEVICES_SEARCH_ID}>{t('Panic devices')}</SearchItem>}
      isPopover
    />
  );
};

export default PanicDeviceDescriptionItem;
