import React, { FC, MouseEvent, useMemo, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import CreateFromInstanceType from '@catalog/CreateFromInstanceTypes/CreateFromInstanceType';
import TemplatesCatalog from '@catalog/templatescatalog/TemplatesCatalog';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Tab, Tabs, Title } from '@patternfly/react-core';
import { CatalogIcon, ImageIcon } from '@patternfly/react-icons';

import CreateVMTabTitle from './components/CreateVMTabTitle/CreateVMTabTitle';
import { CREATE_VM_TAB } from './constants';

import './CreateVMHorizontalNav.scss';

const CreateVMHorizontalNav: FC<RouteComponentProps<{ ns: string }>> = ({
  history,
  location,
  match,
}) => {
  const { t } = useKubevirtTranslation();

  const [currentTab, setCurrentTab] = useState<CREATE_VM_TAB>(
    location.pathname.endsWith(CREATE_VM_TAB.TEMPLATE)
      ? CREATE_VM_TAB.TEMPLATE
      : CREATE_VM_TAB.INSTANCE_TYPES,
  );

  const catalogURL = useMemo(
    () => `/k8s/${match?.params?.ns ? `ns/${match?.params?.ns}` : ALL_NAMESPACES}/catalog`,
    [match],
  );

  const handleTabClick = (_event: MouseEvent, tabIndex: CREATE_VM_TAB) => {
    setCurrentTab(tabIndex);
    history.push(`${catalogURL}${tabIndex}`);
  };

  return (
    <div className="create-vm-horizontal-nav">
      <div className="pf-c-page__main-breadcrumb">
        <Stack className="co-m-pane__heading" hasGutter>
          <StackItem>
            <Title headingLevel="h1">{t('Create new VirtualMachine')}</Title>
          </StackItem>
          <StackItem>{t('Select an option to create a VirtualMachine from.')}</StackItem>
        </Stack>
      </div>
      <Tabs activeKey={currentTab} onSelect={handleTabClick} usePageInsets>
        <Tab
          data-test="instancetypes-tab"
          eventKey={CREATE_VM_TAB.INSTANCE_TYPES}
          title={<CreateVMTabTitle Icon={ImageIcon} titleText={t('InstanceTypes')} />}
        >
          <CreateFromInstanceType />
        </Tab>
        <Tab
          data-test="templates-tab"
          eventKey={CREATE_VM_TAB.TEMPLATE}
          title={<CreateVMTabTitle Icon={CatalogIcon} titleText={t('Template catalog')} />}
        >
          <TemplatesCatalog history={history} location={location} match={match} />
        </Tab>
      </Tabs>
    </div>
  );
};

export default CreateVMHorizontalNav;
