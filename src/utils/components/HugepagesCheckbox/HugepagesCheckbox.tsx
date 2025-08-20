import React, { FC } from 'react';
import classNames from 'classnames';

import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Checkbox, Flex, Stack } from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import HelpTextIcon from '../HelpTextIcon/HelpTextIcon';

type HugepagesCheckboxProps = {
  id: string;
  isHugepages: boolean;
  isInDrilldownMenu?: boolean;
  onHugepagesChange: (event: React.FormEvent<HTMLInputElement>, checked: boolean) => void;
};

const HugepagesCheckbox: FC<HugepagesCheckboxProps> = ({
  id,
  isHugepages,
  isInDrilldownMenu = false,
  onHugepagesChange,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Flex
      className={classNames({
        'pf-v6-u-pl-lg pf-v6-u-py-sm': isInDrilldownMenu,
      })}
      alignItems={{ default: 'alignItemsCenter' }}
      gap={{ default: 'gapXs' }}
    >
      <Checkbox
        id={`hugepages-checkbox-${id}`}
        isChecked={isHugepages}
        label={t('Hugepages')}
        onChange={onHugepagesChange}
      />
      <HelpTextIcon
        bodyContent={
          <Stack hasGutter>
            <div>
              {t(
                'Hugepages are a memory management technique that uses larger memory blocks than the default page size to improve performance. If turned on, hugepages will have 1 GiB, if turned off, hugepages will have 2 MiB.',
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
      />
    </Flex>
  );
};

export default HugepagesCheckbox;
