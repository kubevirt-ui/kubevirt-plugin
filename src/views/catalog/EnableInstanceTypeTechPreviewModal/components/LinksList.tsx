import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, StackItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

const LinksList: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      <StackItem>
        <Button
          component="a"
          href="https://kubevirt.io/user-guide/virtual_machines/instancetypes/"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          isInline
          target="_blank"
          variant={ButtonVariant.link}
        >
          {t('Learn more about InstanceTypes')}
        </Button>
      </StackItem>
      <StackItem>
        <Button
          component="a"
          href="/quickstart?quickstart=creating-virtual-machine-from-volume"
          isInline
          variant={ButtonVariant.link}
        >
          {t('Quick start: Create a VirtualMachine from a volume')}
        </Button>
      </StackItem>
    </>
  );
};

export default LinksList;
