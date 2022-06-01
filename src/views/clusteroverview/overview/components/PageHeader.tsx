import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { Label } from '@patternfly/react-core';

import { KUBEVIRT_HIDE_GETTING_STARTED } from '../utils/utils';

type PageHeadingProps = {
  badge?: React.ReactNode;
  title?: string | JSX.Element;
};

const PageHeader: React.FC<PageHeadingProps> = ({ badge, title }) => {
  const { t } = useKubevirtTranslation();
  const [isHidden, , removeItem] = useLocalStorage(KUBEVIRT_HIDE_GETTING_STARTED);

  return (
    <div className="co-m-nav-title co-m-nav-title--detail">
      <h1 className="co-m-pane__heading">
        <div className="co-m-pane__name co-resource-item">
          <span data-test-id="resource-title" className="co-resource-item__resource-name">
            {title}
          </span>
        </div>
        <span className="co-m-pane__heading-badge">
          {isHidden && (
            <Label color="purple" onClose={removeItem}>
              {t('Show getting started resources')}
            </Label>
          )}
          {badge}
        </span>
      </h1>
    </div>
  );
};

export default PageHeader;
