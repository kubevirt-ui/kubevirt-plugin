import React, { type FC } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Split, SplitItem } from '@patternfly/react-core';
import { TemplatesCatalogProjectsDropdown } from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogProjectsDropdown/TemplatesCatalogProjectsDropdown';
import TemplatesCatalogStyleToggle from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogStyleToggle';
import TemplatesSearchInput from '@virtualmachines/wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesSearchInput';

type TemplatesToolbarProps = {
  filters: KubevirtFilterState;
  isList: boolean;
  namespace: string;
  onSetFilters: OnSetFilters;
  setIsList: (value: boolean) => void;
  setNamespace: (value: string) => void;
};

const TemplatesToolbar: FC<TemplatesToolbarProps> = ({
  filters,
  isList,
  namespace,
  onSetFilters,
  setIsList,
  setNamespace,
}) => {
  return (
    <Split hasGutter>
      <SplitItem>
        <TemplatesCatalogProjectsDropdown onChange={setNamespace} selectedProject={namespace} />
      </SplitItem>
      <SplitItem>
        <TemplatesSearchInput filters={filters} onSetFilters={onSetFilters} />
      </SplitItem>
      <SplitItem isFilled />
      <SplitItem>
        <TemplatesCatalogStyleToggle isList={isList} setIsList={setIsList} />
      </SplitItem>
    </Split>
  );
};

export default TemplatesToolbar;
