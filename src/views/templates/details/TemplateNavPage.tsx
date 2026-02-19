import React, { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import useHideYamlTab, { removeYamlTabs } from '@kubevirt-utils/hooks/useHideYamlTab';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import useEditTemplateAccessReview from './hooks/useIsTemplateEditable';
import { useVirtualMachineTabs } from './hooks/useTemplateTabs';
import TemplatePageTitle from './TemplatePageTitle';

const TemplateNavPage: FC = () => {
  const { name } = useParams<{ name: string }>();
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();

  const [template, loaded] = useK8sWatchData<V1Template>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    name,
    namespace,
  });

  const pages = useVirtualMachineTabs();
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
