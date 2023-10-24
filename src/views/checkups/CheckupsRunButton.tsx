import React, { FC, useCallback } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import classNames from 'classnames';

import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ListPageCreateDropdown, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { createURL } from '@virtualmachines/details/tabs/overview/utils/utils';

const CheckupsRunButton: FC<RouteComponentProps> = ({ history }) => {
  const [namespace] = useActiveNamespace();
  const { t } = useKubevirtTranslation();

  const createItems = {
    network: t('Network latency'),
    storage: t('Storage'),
  };

  const onCreate = useCallback(
    (type: string) => {
      const { pathname } = history?.location;
      switch (type) {
        case 'network':
          return history.push(createURL('network/form', pathname));
        case 'storage':
          return history.push(createURL('storage', pathname));
      }
    },
    [history],
  );

  return (
    <Button
      className={classNames({
        'CheckupsRunButton--main': ALL_NAMESPACES_SESSION_KEY === namespace,
      })}
      isDisabled={ALL_NAMESPACES_SESSION_KEY === namespace}
      variant={ButtonVariant.plain}
    >
      <ListPageCreateDropdown items={createItems} onClick={onCreate}>
        {t('Run checkup')}
      </ListPageCreateDropdown>
    </Button>
  );
};

export default CheckupsRunButton;
