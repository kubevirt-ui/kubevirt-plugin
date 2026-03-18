import React, { FC } from 'react';

import DescriptionItem from '@kubevirt-utils/components/DescriptionItem/DescriptionItem';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import useDeschedulerSetting from '@kubevirt-utils/hooks/useDeschedulerSetting/useDeschedulerSetting';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { V1Template } from '@kubevirt-utils/models';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Switch } from '@patternfly/react-core';

type DeschedulerProps = {
  template: V1Template;
};

const Descheduler: FC<DeschedulerProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  const { deschedulerEnabled, deschedulerSwitchDisabled, onDeschedulerChange } =
    useDeschedulerSetting(template);

  return (
    <>
      <DescriptionItem
        bodyContent={
          <>
            {t(
              'The Descheduler can be used to evict a running VirtualMachine so that the VirtualMachine can be rescheduled onto a more suitable Node via a live migration.',
            )}
            <div className="pf-v6-u-mt-md">
              <ExternalLink href={documentationURL.DESCHEDULER} text={t('Learn more')} />
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
        olsObj={template}
        promptType={OLSPromptType.DESCHEDULER}
      />
    </>
  );
};

export default Descheduler;
