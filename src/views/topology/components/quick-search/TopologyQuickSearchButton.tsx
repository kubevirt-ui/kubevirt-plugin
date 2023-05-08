import React from 'react';
import { useTranslation } from 'react-i18next';

import QuickSearchIcon from '@console/shared/src/components/quick-search/QuickSearchIcon';
import { Button, Tooltip } from '@patternfly/react-core';

import './TopologyQuickSearchButton.scss';

interface QuickSearchButtonProps {
  onClick: () => void;
}

const TopologyQuickSearchButton: React.FC<QuickSearchButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <Tooltip position="right" content={t('kubevirt-plugin~Add to Project')}>
      <Button
        className="odc-topology-quick-search-button"
        data-test="quick-search"
        variant="plain"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={t('kubevirt-plugin~Quick search button')}
      >
        <QuickSearchIcon />
      </Button>
    </Tooltip>
  );
};

export default TopologyQuickSearchButton;
