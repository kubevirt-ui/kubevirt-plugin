import React, { FC } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { SidebarEditorProvider } from '@kubevirt-utils/components/SidebarEditor/SidebarEditorContext';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { HorizontalNav } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import useEditTemplateAccessReview from './hooks/useIsTemplateEditable';
import { useVirtualMachineTabs } from './hooks/useTemplateTabs';
import TemplatePageTitle from './TemplatePageTitle';

const TemplateNavPage: FC = () => {
  const { name } = useParams<{ name: string }>();
  const cluster = useClusterParam();
  const namespace = useNamespaceParam();

  const [template, loaded] = useKubevirtWatchResource<V1Template>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  const pages = useVirtualMachineTabs();
  const { isTemplateEditable } = useEditTemplateAccessReview(template);

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <SidebarEditorProvider isEditable={isTemplateEditable}>
      <TemplatePageTitle template={template} />
      <HorizontalNav pages={pages} resource={template} />
    </SidebarEditorProvider>
  );
};

export default TemplateNavPage;
