import { type FC } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import HeadlessMode from '@kubevirt-utils/components/HeadlessMode/HeadlessMode';
import SearchItem from '@kubevirt-utils/components/SearchItem/SearchItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';

import { updateHeadlessMode } from '../../utils/utils';

type HeadlessModeDescriptionItemProps = {
  canUpdateVM: boolean;
  vm: V1VirtualMachine;
  vmName: string;
};

const HeadlessModeDescriptionItem: FC<HeadlessModeDescriptionItemProps> = ({
  canUpdateVM,
  vm,
  vmName,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <DescriptionItem
      bodyContent={t(
        'Whether to attach the default graphics device or not. VNC will not be available if checked.',
      )}
      breadcrumb="VirtualMachine.spec.template.devices.autoattachGraphicsDevice"
      data-test={`${vmName}-headless`}
      descriptionData={
        <HeadlessMode
          isDisabled={!canUpdateVM}
          updateHeadlessMode={(checked) => updateHeadlessMode(vm, checked)}
          vm={vm}
        />
      }
      descriptionHeader={<SearchItem id="headless-mode">{t('Headless mode')}</SearchItem>}
      isPopover
      olsObj={vm}
      promptType={OLSPromptType.HEADLESS_MODE}
    />
  );
};

export default HeadlessModeDescriptionItem;
