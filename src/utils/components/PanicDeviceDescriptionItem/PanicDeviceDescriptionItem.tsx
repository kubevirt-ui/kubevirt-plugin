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

import EnablePanicDetection from './EnablePanicDetection';
import usePanicDeviceDescriptionState from './hooks/usePanicDeviceDescriptionState';
import { PANIC_DETECTION_BREADCRUMB, PANIC_DETECTION_SEARCH_ID } from './utils/constants';
import { getPanicDetectionHelpText } from './utils/helpers';
import type { PanicDeviceDescriptionItemProps } from './utils/types';

const PanicDeviceDescriptionItem: FC<PanicDeviceDescriptionItemProps> = ({
  disabledTooltipText,
  isDisabled,
  updatePanicDetection,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { isChecked, isPending, panicDeviceModel, showWindowsWarning, statusText, vmName } =
    usePanicDeviceDescriptionState({ vm, vmi });
  const recommendedForWindows = t('Recommended for Windows');
  const canToggle = Boolean(updatePanicDetection) && !isDisabled;

  const handleChange = (checked: boolean): void => {
    if (!updatePanicDetection) {
      return;
    }
    void updatePanicDetection(checked, panicDeviceModel);
  };

  return (
    <DescriptionItem
      bodyContent={getPanicDetectionHelpText(t)}
      breadcrumb={PANIC_DETECTION_BREADCRUMB}
      data-test={`${vmName}-${PANIC_DETECTION_SEARCH_ID}`}
      descriptionData={
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>
            <EnablePanicDetection
              disabledTooltipText={disabledTooltipText}
              isChecked={isChecked}
              isDisabled={!canToggle}
              onChange={handleChange}
              vmName={vmName}
            />
          </FlexItem>
          <FlexItem>{isPending ? <Loading size={spinnerSize.sm} /> : statusText}</FlexItem>
          {showWindowsWarning && (
            <FlexItem>
              <Tooltip content={recommendedForWindows}>
                <Button
                  aria-label={recommendedForWindows}
                  data-test={`${vmName}-${PANIC_DETECTION_SEARCH_ID}-warning`}
                  icon={<YellowExclamationTriangleIcon />}
                  variant={ButtonVariant.plain}
                />
              </Tooltip>
            </FlexItem>
          )}
        </Flex>
      }
      descriptionHeader={
        <SearchItem id={PANIC_DETECTION_SEARCH_ID}>{t('Panic detection')}</SearchItem>
      }
      isPopover
    />
  );
};

export default PanicDeviceDescriptionItem;
