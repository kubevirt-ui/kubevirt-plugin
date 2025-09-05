import React, { FC, MouseEventHandler } from 'react';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Flex, Stack } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

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
        bodyContent={
          <Stack hasGutter>
            <div>
              {t(
                'Hugepages are a memory management technique that uses larger memory blocks than the default page size to improve performance. Hugepages series has hugepages set to 1 GiB, normal series has hugepages set to 2 MiB.',
              )}
            </div>
            <Button
              component="a"
              href={documentationURL.HUGEPAGES}
              isInline
              target="_blank"
              variant="link"
            >
              {t('View documentation')} <ExternalLinkAltIcon />
            </Button>
          </Stack>
        }
        headerContent={t('Hugepages')}
        onClick={handleClick}
      />
    </Flex>
  );
};

export default HugepagesInfo;
