import React, { FC, useState } from 'react';

import { modelToGroupVersionKind, NamespaceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Button, ButtonVariant, Skeleton } from '@patternfly/react-core';

import { SHOW_MAX_ITEMS } from './constants';

type ExpandableProjectListProps = {
  emptyMessage?: string;
  loaded?: boolean;
  maxItems?: number;
  projectNames: string[];
};

const ExpandableProjectList: FC<ExpandableProjectListProps> = ({
  emptyMessage,
  loaded = true,
  maxItems = SHOW_MAX_ITEMS,
  projectNames,
}) => {
  const { t } = useKubevirtTranslation();
  const [expand, setExpand] = useState(false);

  if (!loaded) return <Skeleton />;

  if (isEmpty(projectNames)) return <span>{emptyMessage ?? t('No projects matched')}</span>;

  return (
    <>
      {projectNames.slice(0, expand ? projectNames.length : maxItems).map((project) => (
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          key={project}
          name={project}
        />
      ))}
      {projectNames.length > maxItems && (
        <Button onClick={() => setExpand(!expand)} variant={ButtonVariant.link}>
          {expand ? t('Show less') : t('+{{num}} more', { num: projectNames.length - maxItems })}
        </Button>
      )}
    </>
  );
};

export default ExpandableProjectList;
