import type { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { spinnerSize } from '@patternfly/react-core';

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
}) => {
  const { t } = useKubevirtTranslation();
  const { isChecked, panicDeviceModel, preferenceLoading, vmName } = usePanicDeviceDescriptionState(
    { vm },
  );
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
        preferenceLoading ? (
          <Loading size={spinnerSize.sm} />
        ) : (
          <EnablePanicDetection
            disabledTooltipText={disabledTooltipText}
            isChecked={isChecked}
            isDisabled={!canToggle}
            onChange={handleChange}
            vmName={vmName}
          />
        )
      }
      descriptionHeader={
        <SearchItem id={PANIC_DETECTION_SEARCH_ID}>{t('Panic detection')}</SearchItem>
      }
      isPopover
    />
  );
};

export default PanicDeviceDescriptionItem;
