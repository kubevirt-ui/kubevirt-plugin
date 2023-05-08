import React from 'react';
import { useTranslation } from 'react-i18next';

import { Shortcut, ShortcutTable } from '@console/shared';
import { InfoCircleIcon } from '@patternfly/react-icons';

import './RegroupHint.scss';

const RegroupHint: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="odc-regroup-hint">
      <InfoCircleIcon className="odc-regroup-hint__icon" />
      <span className="odc-regroup-hint__text">
        <ShortcutTable>
          <Shortcut shift drag>
            {t('kubevirt-plugin~Edit application grouping')}
          </Shortcut>
        </ShortcutTable>
      </span>
    </div>
  );
};

export default RegroupHint;
