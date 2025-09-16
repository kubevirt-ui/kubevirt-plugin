import React, { FC } from 'react';

import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import useDeschedulerSetting from '@kubevirt-utils/hooks/useDeschedulerSetting/useDeschedulerSetting';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { Button, ButtonVariant, Switch } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

type DeschedulerProps = {
  template: V1Template;
};

const Descheduler: FC<DeschedulerProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { deschedulerEnabled, deschedulerSwitchDisabled, onDeschedulerChange } =
    useDeschedulerSetting(template);

  return (
    <>
      <VirtualMachineDescriptionItem
        bodyContent={
          <>
            {t(
              'The Descheduler can be used to evict a running VirtualMachine so that the VirtualMachine can be rescheduled onto a more suitable Node via a live migration.',
            )}
            <div className="margin-top">
              <Button
                className="no-left-padding"
                component="a"
                href={documentationURL.DESCHEDULER}
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
                target="_blank"
                variant={ButtonVariant.link}
              >
                {t('Learn more')}
              </Button>
            </div>
          </>
        }
        descriptionData={
          <Switch
            id="descheduler-switch"
            isChecked={deschedulerEnabled}
            isDisabled={deschedulerSwitchDisabled}
            onChange={(_event, checked) => onDeschedulerChange(checked)}
          />
        }
        descriptionHeader={t('Descheduler')}
        isPopover
      />
    </>
  );
};

export default Descheduler;
