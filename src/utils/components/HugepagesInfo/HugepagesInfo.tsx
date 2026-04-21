import React, { FC, MouseEventHandler } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { Flex, Stack } from '@patternfly/react-core';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

const HugepagesInfo: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  const handleClick: MouseEventHandler<HTMLSpanElement> = (event) => {
    event.stopPropagation();
  };

  return (
    <Flex gap={{ default: 'gapXs' }}>
      <span>{t('Hugepages')}</span>
      <HelpTextIcon
        bodyContent={(hide) => (
          <PopoverContentWithLightspeedButton
            content={
              <Stack hasGutter>
                <div>
                  {t(
                    'Hugepages are a memory management technique that uses larger memory blocks than the default page size to improve performance. Hugepages series has hugepages set to 1 GiB, normal series has hugepages set to 2 MiB.',
                  )}
                </div>
                <ExternalLink href={documentationURL.HUGEPAGES} text={t('View documentation')} />
              </Stack>
            }
            hide={hide}
            promptType={OLSPromptType.HUGEPAGES}
          />
        )}
        headerContent={t('Hugepages')}
        onClick={handleClick}
      />
    </Flex>
  );
};

export default HugepagesInfo;
