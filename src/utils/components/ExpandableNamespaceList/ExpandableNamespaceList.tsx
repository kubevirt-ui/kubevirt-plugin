import React, { FC, useState } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Skeleton } from '@patternfly/react-core';

import { SHOW_MAX_ITEMS } from './constants';

type ExpandableNamespaceListProps = {
  emptyMessage?: string;
  loaded?: boolean;
  maxItems?: number;
  namespaceNames: string[];
};

const ExpandableNamespaceList: FC<ExpandableNamespaceListProps> = ({
  emptyMessage,
  loaded = true,
  maxItems = SHOW_MAX_ITEMS,
  namespaceNames,
}) => {
  const { t } = useKubevirtTranslation();
  const [expand, setExpand] = useState(false);

  if (!loaded) return <Skeleton />;

  if (isEmpty(namespaceNames)) return <span>{emptyMessage ?? t('No namespaces matched')}</span>;

  return (
    <>
      {namespaceNames.slice(0, expand ? namespaceNames.length : maxItems).map((namespace) => (
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          key={namespace}
          name={namespace}
        />
      ))}
      {namespaceNames.length > maxItems && (
        <Button onClick={() => setExpand(!expand)} variant={ButtonVariant.link}>
          {expand ? t('Show less') : t('+{{num}} more', { num: namespaceNames.length - maxItems })}
        </Button>
      )}
    </>
  );
};

export default ExpandableNamespaceList;
