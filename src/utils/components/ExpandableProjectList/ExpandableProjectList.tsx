import React, { FC, useEffect, useRef, useState } from 'react';

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
  const isFirstRun = useRef(true);

  // Notify virtualized table to re-measure after expand/collapse so row overlap is avoided
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    });
    return () => cancelAnimationFrame(id);
  }, [expand]);

  if (!loaded) {
    return (
      <div style={{ alignItems: 'center', display: 'flex', minHeight: '48px' }}>
        <Skeleton />
      </div>
    );
  }

  const cellContent = (
    <div style={{ minHeight: '48px' }}>
      {isEmpty(projectNames) ? (
        <span>{emptyMessage ?? t('No projects matched')}</span>
      ) : (
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
              {expand
                ? t('Show less')
                : t('+{{num}} more', { num: projectNames.length - maxItems })}
            </Button>
          )}
        </>
      )}
    </div>
  );

  return cellContent;
};

export default ExpandableProjectList;
