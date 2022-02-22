import * as React from 'react';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useURLParams } from '@kubevirt-utils/hooks/useURLParams';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarPanel,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { CustomizeError } from './components/CustomizeError';
import { CustomizeForm } from './components/CustomizeForm';
import { CustomizeVirtualMachineScheleton } from './components/CustomizeVirtualMachineScheleton';

import './CustomizeVirtualMachine.scss';

type RightHeadingProps = {
  template: V1Template;
};

const RightHeader: React.FC<RightHeadingProps> = ({ template }) => {
  const { t } = useKubevirtTranslation();
  if (!template?.metadata?.annotations) return null;

  const title = template.metadata?.annotations['openshift.io/display-name'];
  const documentationLink = template.metadata?.annotations['openshift.io/documentation-url'];
  const description = template.metadata?.annotations?.description;
  return (
    <Stack className="customize-vm__right-header">
      <StackItem>
        <Title headingLevel="h1">{title}</Title>
      </StackItem>
      <StackItem>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          href={documentationLink}
          target="_blank"
          component="a"
          iconPosition="right"
          className="pf-u-pl-0"
        >
          {t('View documentation')}
        </Button>
      </StackItem>

      <StackItem>
        <p>{description}</p>
      </StackItem>
    </Stack>
  );
};

const CustomizeVirtualMachine: React.FC = () => {
  const { t } = useKubevirtTranslation();
  const { params } = useURLParams();
  const name = params.get('name');
  const templateNamespace = params.get('namespace');

  const [template, loaded, error] = useK8sWatchResource<V1Template>({
    groupVersionKind: {
      group: 'template.openshift.io',
      version: 'v1',
      kind: 'Template',
    },
    isList: false,
    namespaced: true,
    name,
    namespace: templateNamespace,
  });

  const loading = !loaded && !error;

  if (error) return <CustomizeError />;

  return (
    <Sidebar isPanelRight hasGutter className="customize-vm__container">
      <SidebarContent className="customize-vm__content">
        <Title headingLevel="h1">{t('Create VirtualMachine from template')}</Title>
        {template && <CustomizeForm template={template} />}
        {loading && <CustomizeVirtualMachineScheleton />}
      </SidebarContent>

      <SidebarPanel width={{ '2xl': 'width_50', default: 'width_33' }}>
        <RightHeader template={template} />
      </SidebarPanel>
    </Sidebar>
  );
};

export default CustomizeVirtualMachine;
