import React, { FC, useMemo } from 'react';

import Loading from '@kubevirt-utils/components/Loading/Loading';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import useEditTemplateAccessReview from './hooks/useIsTemplateEditable';
import { useTemplateTabs } from './hooks/useTemplateTabs';
import useTemplateWatch from './hooks/useTemplateWatch';
import TemplatePageTitle from './TemplatePageTitle';

const TemplateNavPage: FC = () => {
  const [template, loaded] = useTemplateWatch();

  const pages = useTemplateTabs();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);
  const { hideYamlTab } = useHideYamlTab();
  const filteredPages = useMemo(() => removeYamlTabs(pages, hideYamlTab), [pages, hideYamlTab]);

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <SidebarEditorProvider isEditable={isTemplateEditable}>
      <TemplatePageTitle template={template} />
      <HorizontalNav pages={filteredPages} resource={template} />
    </SidebarEditorProvider>
  );
};

export default TemplateNavPage;
