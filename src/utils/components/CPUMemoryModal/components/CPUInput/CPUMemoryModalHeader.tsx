import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, Popover, Title, TitleSizes } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './CPUMemoryModalHeader.scss';

const CPUMemoryModalHeader: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <Title
        className="cpu-memory-modal-header"
        headingLevel="h4"
        id="cpu-memory-modal-title"
        size={TitleSizes.md}
        title={t('Edit CPU | Memory')}
      >
        {t('Edit CPU | Memory')}
        <Popover bodyContent={<div>{t('CPUs = sockets x threads x cores')}</div>} hasAutoWidth>
          <Button className="cpu-memory-modal-header__button" variant={ButtonVariant.plain}>
            <HelpIcon />
          </Button>
        </Popover>
      </Title>
    </>
  );
};

export default CPUMemoryModalHeader;
