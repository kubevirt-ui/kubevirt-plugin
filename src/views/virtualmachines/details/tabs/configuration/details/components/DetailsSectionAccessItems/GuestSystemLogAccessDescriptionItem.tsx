import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Switch } from '@patternfly/react-core';

import { updateGuestSystemAccessLog } from '../../utils/utils';

type GuestSystemLogAccessDescriptionItemProps = {
  canUpdateVM: boolean;
  isChecked?: boolean;
  isDisabled: boolean;
  setIsChecked: (checked: boolean) => void;
  vm: V1VirtualMachine;
};

const GuestSystemLogAccessDescriptionItem: FC<GuestSystemLogAccessDescriptionItemProps> = ({
  canUpdateVM,
  isChecked,
  isDisabled,
  setIsChecked,
  vm,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      bodyContent={t(
        'Applying the start/pause mode to this virtual machine will cause it to partially reboot and pause.',
      )}
      descriptionData={
        <Switch
          id="guest-system-log-access"
          isChecked={isChecked}
          isDisabled={isDisabled || !canUpdateVM}
          onChange={(_event, checked) => {
            setIsChecked(checked);
            void updateGuestSystemAccessLog(vm, checked);
          }}
        />
      }
      descriptionHeader={
        <SearchItem id="guest-system-log-access">{t('Guest system log access')}</SearchItem>
      }
      isPopover
      olsObj={vm}
      promptType={OLSPromptType.GUEST_SYSTEM_LOG_ACCESS}
    />
  );
};

export default GuestSystemLogAccessDescriptionItem;
