import React, { useMemo } from 'react';

import { PF_TABLE_CHECK_CLASS } from '@kubevirt-utils/hooks/useDataViewTableSort/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Checkbox } from '@patternfly/react-core';

type SelectionColumnParams = {
  allSelected: boolean;
  dataTest?: string;
  handleSelectAll: () => void;
  showSelectAllCheckbox: boolean;
  someSelected: boolean;
};

export const useSelectionColumn = ({
  allSelected,
  dataTest,
  handleSelectAll,
  showSelectAllCheckbox,
  someSelected,
}: SelectionColumnParams): { cell: React.ReactNode; props: { className: string } } => {
  const { t } = useKubevirtTranslation();
  const selectAllId = dataTest ? `${dataTest}-select-all` : 'select-all-rows';

  return useMemo(() => {
    if (!showSelectAllCheckbox) {
      return {
        cell: <span className="pf-v6-u-screen-reader">{t('Selection')}</span>,
        props: { className: PF_TABLE_CHECK_CLASS },
      };
    }

    const getCheckboxState = (): boolean | null => {
      if (allSelected) return true;
      if (someSelected) return null;
      return false;
    };

    return {
      cell: (
        <Checkbox
          aria-label={t('Select all rows')}
          data-test={selectAllId}
          id={selectAllId}
          isChecked={getCheckboxState()}
          onChange={() => {
            handleSelectAll();
          }}
        />
      ),
      props: { className: PF_TABLE_CHECK_CLASS },
    };
  }, [showSelectAllCheckbox, allSelected, someSelected, selectAllId, handleSelectAll, t]);
};
