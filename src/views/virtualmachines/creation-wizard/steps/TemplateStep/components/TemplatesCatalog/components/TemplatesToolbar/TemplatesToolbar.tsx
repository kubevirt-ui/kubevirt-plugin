import React, { FC } from 'react';

import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Split, SplitItem } from '@patternfly/react-core';
import { TemplatesCatalogNamespacesDropdown } from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogNamespacesDropdown/TemplatesCatalogNamespacesDropdown';
import TemplatesCatalogStyleToggle from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesCatalogStyleToggle';
import TemplatesSearchInput from '@virtualmachines/creation-wizard/steps/TemplateStep/components/TemplatesCatalog/components/TemplatesToolbar/components/TemplatesSearchInput';

type TemplatesToolbarProps = {
  isList: boolean;
  namespace: string;
  onFilterChange: OnFilterChange;
  setIsList: (value: boolean) => void;
  setNamespace: (value: string) => void;
};

const TemplatesToolbar: FC<TemplatesToolbarProps> = ({
  isList,
  namespace,
  onFilterChange,
  setIsList,
  setNamespace,
}) => {
  return (
    <Split hasGutter>
      <SplitItem>
        <TemplatesCatalogNamespacesDropdown onChange={setNamespace} selectedNamespace={namespace} />
      </SplitItem>
      <SplitItem>
        <TemplatesSearchInput onFilterChange={onFilterChange} />
      </SplitItem>
      <SplitItem isFilled />
      <SplitItem>
        <TemplatesCatalogStyleToggle isList={isList} setIsList={setIsList} />
      </SplitItem>
    </Split>
  );
};

export default TemplatesToolbar;
