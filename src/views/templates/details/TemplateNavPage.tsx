import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import {
  modelToGroupVersionKind,
  TemplateModel,
  V1Template,
} from '@kubevirt-ui/kubevirt-api/console';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import { HorizontalNav, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Bullseye } from '@patternfly/react-core';

import { useVirtualMachineTabs } from './hooks/useTemplateTabs';
import TemplatePageTitle from './TemplatePageTitle';

export type TemplateNavPageProps = RouteComponentProps<{
  ns: string;
  name: string;
}>;

const TemplateNavPage: React.FC<TemplateNavPageProps> = ({
  match: {
    params: { ns: namespace, name },
  },
}) => {
  const [template, loaded] = useK8sWatchResource<V1Template>({
    groupVersionKind: modelToGroupVersionKind(TemplateModel),
    name,
    namespace,
    isList: false,
    namespaced: true,
  });
  const pages = useVirtualMachineTabs();

  if (!loaded)
    return (
      <Bullseye>
        <Loading />
      </Bullseye>
    );

  return (
    <>
      <TemplatePageTitle template={template} />
      <HorizontalNav pages={pages} resource={template} />
    </>
  );
};

export default TemplateNavPage;
